// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

contract invoiceContract{
    address owner;
    uint totalInvoices;

    struct invoice{
        address sellerAddress;
        uint sellerPAN;
        uint invoiceAmount;
        uint invoiceDate;
        string status;
    }

    struct buyerDetail{
        address buyerAddress;
    }

    mapping(uint => invoice[]) public invoices;
    mapping(uint => buyerDetail) public buyerDetails;

    uint[] public buyerPANs;

    constructor (){
        owner = msg.sender;
        totalInvoices = 0;
    }

    function createInvoice(address buyerAddress, uint sellerPAN, uint buyerPAN, uint amount, uint date, string memory status) public{
        totalInvoices++;
        buyerDetails[buyerPAN] = buyerDetail(buyerAddress);
        invoice memory newInvoice = invoice(msg.sender, sellerPAN, amount, date, status);
        invoices[buyerPAN].push(newInvoice);
    }

    function getAllTrans(uint buyerPAN) public view returns (invoice[] memory){
        invoice[] memory allTrans = invoices[buyerPAN];
        return allTrans;
    }
}