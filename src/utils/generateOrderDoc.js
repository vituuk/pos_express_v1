const fs=require("fs");
const path=require("path");
const PizZip=require("pizzip"); 
const Docxtemplater=require("docxtemplater"); 
const dayjs=require("dayjs"); 

const generateDoc=(order)=>{
    console.log("order",order);
    const templatePath=path.join(__dirname,"../template/invoice_templates.docx");
    const content=fs.readFileSync(templatePath,"binary"); 
    const zip=new PizZip(content);
    const doc=new Docxtemplater(zip,{
        paragraphLoop:true,
        linebreaks:true
    });

    doc.render({
        orderNumber:order.orderNumber,
        firstName:order.customer.firstName,
        lastName:order.customer.lastName,
        discount:order.discount,
        total:order.total,
        items:order.orderDetails,
        // orderDetails:order.orderDetails,
        // total:order.total,
        // discount:order.discount,
        orderDate:dayjs(order.orderDate).format("DD-MM-YYYY"),
        
    })
    const buffer=doc.getZip().generate({
        type:"nodebuffer",
        compression:"DEFLATE"
    })
   return buffer;
}

module.exports=generateDoc;