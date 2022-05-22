// import { useState } from 'react';
import './App.css';
import contract from './artifacts/contracts/invoiceContract.sol/invoiceContract.json';
import { ethers } from 'ethers';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import AsyncCSV from './Report';

const{REACT_APP_SECRET_KEY, REACT_APP_IV, REACT_APP_CONTRACT_ADDRESS} = process.env;

var CryptoJS = require("crypto-js");
var key = REACT_APP_SECRET_KEY;
var iv  = REACT_APP_IV;

key = CryptoJS.enc.Base64.parse(key);
iv = CryptoJS.enc.Base64.parse(iv);

const theme = createTheme();

const contractAddress = REACT_APP_CONTRACT_ADDRESS;
const abi = contract.abi;

function App() {

  const startPayment = async ({buyerAddress, sellerPAN, buyerPAN, amount }) => {
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");
  
      await window.ethereum.send("eth_requestAccounts");
      const accounts = await window.ethereum.send("eth_accounts");
      console.log("Found account", accounts);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("Provider: ", provider);
      const signer = provider.getSigner();
      console.log("Signer: ", signer);
      ethers.utils.getAddress(buyerAddress);
      const invoice = {
        sellerPAN: CryptoJS.AES.encrypt(sellerPAN, key, {iv:iv}).toString(),
        buyerPAN: CryptoJS.AES.encrypt(buyerPAN, key, {iv:iv}).toString(),
        invoiceAmount: (amount*1000000000000000000).toString(),
        invoiceDate: Date.now(),
      }
      const invoice_contract = new ethers.Contract(contractAddress, abi, signer);

      var invoice_id = -1;
      invoice_contract.on("invoiceCreated", (invoiceID) => {
        invoice_id = invoiceID.toNumber();
      });

      const tx1 = await invoice_contract.createInvoice(buyerAddress, invoice.sellerPAN, invoice.buyerPAN, invoice.invoiceAmount, invoice.invoiceDate, "pending");
      console.log("Executing transaction... please wait");
      await tx1.wait();
      console.log("Completed, transaction hash:", tx1.hash);
      try{
        const tx2 = await signer.sendTransaction({
          to: buyerAddress,
          value: ethers.utils.parseEther(amount)
        });
        console.log("Sending ETH... please wait");
        await tx2.wait();
        console.log("tx2", tx2);
      } catch (error) {
        console.log("Error sending ether", error);
        const tx3 = await invoice_contract.updateInvoiceStatus(invoice_id, "Failed");
        console.log("Updating Status... please wait");
        await tx3.wait();
        console.log("Failed status updated");
      }

      const tx3 = await invoice_contract.updateInvoiceStatus(invoice_id, "Completed");
      console.log("Updating Status... please wait");
      await tx3.wait();
      console.log("Completed status updated");
    } catch (err) {
      console.log("Error: ", err);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(event.target.sellerPAN.value);
    const data = new FormData(event.target);
    // setError();
    await startPayment({
      ether: data.get("amount"),
      buyerAddress: data.get("receiverAddress"),
      sellerPAN: data.get("sellerPAN"),
      buyerPAN: data.get("buyerPAN"),
      amount: data.get("amount"),
    });
  }

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/random)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Make transaction
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="sellerPAN"
                label="Your PAN number"
                name="sellerPAN"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="buyerPAN"
                label="Receiver PAN number"
                name="buyerPAN"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="receiverAddress"
                label="Receiver Wallet Address"
                type="text"
                id="receiverAddress"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="amount"
                label="Amount"
                type="number"
                id="amount"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onSubmit={handleSubmit}
              >
                Send
              </Button>
              </Box>
              <AsyncCSV/>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;