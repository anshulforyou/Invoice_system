import { useEffect, useState } from 'react';
import './App.css';
import contract from './artifacts/contracts/invoiceContract.sol/invoiceContract.json';
import { ethers } from 'ethers';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
// import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const contractAddress = "0xC95d73FD72261C8b0433C0d07Bfac1F2AF3A6B1c";
const abi = contract.abi;

function App() {
  // const checkWalletIsConnected = async () => {
  //   const {ethereum} = window;
  //   if(!ethereum) {
  //     console.log("Make sure you have metamask installed and logged in");
  //     return;
  //   }else{
  //     console.log("Metamask is connected");
  //   }
  //   const accounts = await ethereum.request({method: "eth_accounts"});
  //   console.log(accounts);
  //   if(accounts.length !== 0) {
  //     const account = accounts[0];
  //     console.log("Account: ", account);
  //     setCurrentAccount(account);
  //   } else {
  //     console.log("No authorized account found");
  //     return false;
  //   }
  // }

  // const connectWalletHandler = async () => {
  //   const { ethereum } = window;
  //   if (!ethereum){
  //     alert("Please install Metamask");
  //   }

  //   try {
  //     const accounts = await ethereum.request({method:'eth_requestAccounts'});
  //     console.log("Found account", accounts[0]);
  //     setCurrentAccount(accounts[0]);
  //   } catch (error) {
  //     console.log("Error connecting to wallet", error);
  //   }
  // }
  
  // const [currentAccount, setCurrentAccount] = useState(null);

  // useEffect(() => {
  //   // if(checkWalletIsConnected()===false){
  //     // console.log("Inside loop");
  //     connectWalletHandler();
  //   // };
  // }, []);

  const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
  };

  const startPayment = async ({ setError, setTxs, ether, addr }) => {
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
      ethers.utils.getAddress(addr);
      const tx = await signer.sendTransaction({
        to: addr,
        value: ethers.utils.parseEther(ether)
      });
      console.log({ ether, addr });
      console.log("tx", tx);
      setTxs([tx]);
    } catch (err) {
      setError(err.message);
    }
  };

  // const createInvoiceTransaction = async (sellerPAN, buyerPAN, amount, date) => {
  //   const { ethereum } = window;
  //   console.log(amount);
  //   if(ethereum){
  //     const provider = new ethers.providers.Web3Provider(ethereum);
  //     const signer = provider.getSigner();
  //     const invoice = {
  //       sellerPAN: cyrb53(sellerPAN),
  //       buyerPAN: cyrb53(buyerPAN),
  //       invoiceAmount: amount,
  //       invoiceDate: Date.now(),
  //     }
  //     console.log(invoice);
  //     const invoice_contract = new ethers.Contract(contractAddress, abi, signer);
  //     console.log(invoice_contract);
  //     const tx = await invoice_contract.createInvoice(invoice.sellerPAN, invoice.buyerPAN, invoice.invoiceAmount, invoice.invoiceDate);
  //     console.log(tx);
  //     console.log("Executing transaction... please wait");
  //     await tx.wait();
  //     console.log("Completed, transaction hash:", tx.hash);  
  //   }else{
  //     console.log("Ethereum object does not exist");
  //   }
  // }
  const [error, setError] = useState();
  const [txs, setTxs] = useState([]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(event.target.sellerPAN.value);
    // createInvoiceTransaction(event.target.sellerPAN.value, event.target.buyerPAN.value, event.target.amount.value, event.target.Date.value);
    const data = new FormData(event.target);
    setError();
    await startPayment({
      setError,
      setTxs,
      ether: data.get("amount"),
      addr: data.get("receiverAddress")
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
              {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              /> */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onSubmit={handleSubmit}
              >
                Send
              </Button>
              {/* <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid> */}
                {/* <Grid item> */}
                  {/* <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link> */}
                {/* </Grid> */}
              {/* </Grid> */}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;