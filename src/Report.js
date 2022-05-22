import React, { Component } from 'react';
import { CSVLink } from "react-csv";

import contract from './artifacts/contracts/invoiceContract.sol/invoiceContract.json';
import { ethers } from 'ethers';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

const{REACT_APP_SECRET_KEY, REACT_APP_IV, REACT_APP_CONTRACT_ADDRESS} = process.env;

var CryptoJS = require("crypto-js");
var key = REACT_APP_SECRET_KEY;
var iv  = REACT_APP_IV;

key = CryptoJS.enc.Base64.parse(key);
iv = CryptoJS.enc.Base64.parse(iv);

const contractAddress = REACT_APP_CONTRACT_ADDRESS;
const abi = contract.abi;
 
const headers = [
  { label: "ID", key: "id" },
  { label: "Amount", key: "amount" },
  { label: "Date", key: "date" },
  { label: "buyerPAN", key: "buyerPAN" },
  { label: "sellerPAN", key: "sellerPAN" },
  { label: "status", key: "status" }
];
 
class AsyncCSV extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
    this.csvLinkEl = React.createRef();
  }

  getTransactions = async(buyerPANvalue) => {
    const { ethereum } = window;
    if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const invoice_contract = new ethers.Contract(contractAddress, abi, signer);
        const cypher = CryptoJS.AES.encrypt(buyerPANvalue, key, { iv: iv }).toString();
        const tx = await invoice_contract.getAllTrans(cypher);
        if (tx.length > 0) {
            const data = [];
            console.log(tx[0]['id']);
            for(let i=0; i<tx.length; i++){
                var bytes = CryptoJS.AES.decrypt(tx[i]['sellerPAN'], key, {iv:iv});
                var sellerPAN = bytes.toString(CryptoJS.enc.Utf8);
                data.push({
                    id: tx[i]['id'].toNumber(),
                    amount: tx[i]['invoiceAmount']/1000000000000000000,
                    date: new Date(tx[i]['invoiceDate'].toNumber()).toLocaleDateString("en-US"),
                    buyerPAN: buyerPANvalue,
                    sellerPAN: sellerPAN,
                    status: tx[i]['status']
                });
            }
            return data;
        }else{
            console.log("No transactions found");
            return [];
        }
    }else{
      console.log("Ethereum object does not exist");
    }
  }
 
  downloadReport = async (event) => {
    event.preventDefault();
    const data = await this.getTransactions(event.target.buyerPAN.value);
    this.setState({ data: data }, () => {
      setTimeout(() => {
        this.csvLinkEl.current.link.click();
      });
    });
  }
 
  render() {
    const { data } = this.state;
 
    return (
      <div>
        <Box component="form" noValidate onSubmit={this.downloadReport} sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                name="buyerPAN"
                label="Buyer PAN number"
                id="buyerPAN"
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onSubmit={this.downloadReport}
            >
                Get all transactions
            </Button>
        </Box>
        <CSVLink
          headers={headers}
          filename="Transactions.csv"
          data={data}
          ref={this.csvLinkEl}
        />
      </div>
    );
  }
}
 
export default AsyncCSV;