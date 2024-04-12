

const errorMiddleware = (err, req, res, next)=>{
    console.log(err.stack)

    let statusCode = err.statusCode || 500
    let errorMessage = err.message || "Internal Server Error"

    res.status(statusCode).json({
        status: statusCode,
        error: errorMessage,
    })
}

export default errorMiddleware