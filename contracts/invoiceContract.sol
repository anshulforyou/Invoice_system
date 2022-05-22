// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

contract invoiceContract{
    address owner;
    uint totalInvoices;

    struct invoice{
        uint id;
        address sellerAddress;
        string sellerPAN;
        string invoiceAmount;
        uint invoiceDate;
        string status;
    }

    struct location{
        uint index;
        string buyerPAN;
    }

    struct buyerDetail{
        address buyerAddress;
    }

    mapping(string => invoice[]) public invoices;
    mapping(uint => location) public locationInvoices;
    mapping(string => buyerDetail) public buyerDetails;

    constructor (){
        owner = msg.sender;
        totalInvoices = 0;
    }

    event invoiceCreated(uint invoiceID);

    function createInvoice(address buyerAddress, string memory sellerPAN, string memory buyerPAN, string memory amount, uint date, string memory status) public returns (uint){
        buyerDetails[buyerPAN] = buyerDetail(buyerAddress);
        invoice memory newInvoice = invoice(totalInvoices, msg.sender, sellerPAN, amount, date, status);
        location memory objLocation = location(invoices[buyerPAN].length, buyerPAN);
        locationInvoices[totalInvoices] = objLocation;
        // idInvoices[totalInvoices] = newInvoice;
        invoices[buyerPAN].push(newInvoice);
        totalInvoices++;
        emit invoiceCreated(totalInvoices-1);
        return totalInvoices-1;
    }

    function updateInvoiceStatus(uint invoiceID, string memory status) public{
        if(msg.sender == invoices[locationInvoices[invoiceID].buyerPAN][locationInvoices[invoiceID].index].sellerAddress){
            invoices[locationInvoices[invoiceID].buyerPAN][locationInvoices[invoiceID].index].status = status;
        }
    }

    function getAllTrans(string memory buyerPAN) public view returns (invoice[] memory){
        invoice[] memory allTrans = invoices[buyerPAN];
        return allTrans;
    }
}