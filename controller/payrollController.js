import AuthUser from "../models/authModel.js";
import Payroll from "../models/payrollModel.js";


export const addPayroll = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {staff, salary} = req.body

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const isExist = await Payroll.findOne({user: staff})

        if(isExist){
            return res.status(403).json({
                success: false,
                message: `Staff ${isExist.firstName}'s payroll already exist!`
            })
        }

        const newPayroll = new Payroll({
            user: staff,
            salary: Number(salary),
        })

        await newPayroll.save()

        const getPayrolls = await Payroll.find()

        res.status(200).json({
            success: true,
            message: 'Payroll saved successfully',
            data: getPayrolls
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const updatePayroll = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {staff, salary} = req.body
        const {id} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const isExist = await Payroll.findOne({_id: id})

        if(!isExist){
            return res.status(403).json({
                success: false,
                message: `Payroll does not exist!`
            })
        }

        const update = await Payroll.findByIdAndUpdate({_id: id},{
            user: staff,
            salary
        },{new: true})

        const getPayrolls = await Payroll.find()

        res.status(200).json({
            success: true,
            message: 'Payroll updated successfully!',
            data: getPayrolls
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const getSinglePayroll = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {staffId} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const payroll = await Payroll.findOne({user: staffId}).populate('user')

        if(!payroll){
            return res.status(403).json({
                success: false,
                message: `Staff not found!`
            })
        }

        res.status(200).json({
            success: true,
            message: 'Staff payroll data fetched successfully!',
            data: payroll
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}

export const getPayrolls = async (req, res) => {
    try {
        const {userId} = req.body.user

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const payrolls = await Payroll.find()
        .populate({
            path: 'user',
            select: 'staffId firstName lastName email role department createdAt'
        })
        .sort({
            createdAt: -1
        })

        res.status(200).json({
            success: true,
            message: 'Payrolls fetched successfully!',
            data: payrolls
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}
// const generatePDF = (data, res) => {
//     // Fetch the HTML template file
//     fs.readFile('./views/invoice.html', function(err, html){
//         if(err){ throw err; }
    
//         // Create a PDF from the HTML file content
//         var pdfDoc = new PDFDocument();
        
//         var stream = pdfDoc.pipe(fs.createWriteStream('./public/pdf/' + data.name + '.pdf'));
//         pdfDoc.fontSize(10).text("Invoice", { underline: true });
//         pdfDoc.moveDown();
//         pdfDoc.fontSize(8);
//         pdfDoc.text("Date: " + moment().format('MMM DD YYYY'),{align:'right'});
//         pdfDoc.addPage();
//         pdfDoc.text(html);
//         pdfDoc.moveDown();
//         pdfDoc.text("Total Amount: $" + parseFloat(data.totalAmount).toFixed(2));
//         pdfDoc.moveDown();
//         pdfDoc.text("Paid Amount: $" + parseFloat(data.paidAmount).toFixed(2)).fill('#6c7a89');
//         pdfDoc.moveDown();
//         pdfDoc.text("Balance Am ount: $" + parseFloat((parseFloat(data.totalAmount)-parseFloat(data = data.paidAmount))).toFixed(2
//         pdfDoc.text("Balance Amount: $" + parseFloat((parseFloat(data.totalAmount)-parseFloat(data.paidAmount))).toFixed(2
//         pdfDoc.text("Balance Due: $" + parseFloat((parseFloat(data.totalAmount)-parseFloat(data.paidAmount))).toFixed(2)).
//         pdfDoc.text("Balance Amount: $" + parseFloat((parseFloat(data.totalAmount)-parseFloat(data.paidAmount))).toFixed(2
//         pdfDoc.text("Balance Amount: $" + parseFloat((parseFloat(data.totalAmount)-parseFloat(data.paidAmount))).toFixed(2


export const deletePayroll = async (req, res) => {
    try {
        const {userId} = req.body.user
        const {id} = req.params

        const user = await AuthUser.findById(userId)

        if(!user){
            return res.status(403).json({
                success: false,
                message: 'Authorization failed!'
            })
        }

        const removePayroll = await Payroll.findByIdAndDelete(id)

        if(!removePayroll){
            return res.status(401).json({
                success: false,
                message: 'Payroll not found!'
            })
        }

        const payrolls = await Payroll.find()

        res.status(200).json({
            success: true,
            message: 'Payrolls deleted successfully!',
            data: payrolls
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}