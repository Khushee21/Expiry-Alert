//Success Response helper
export function sendSuccess(res, data, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data,
    });
}

//Error response helper
export function sendError(res, message = 'Something went wrong', statusCode = 500, error = null) {
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error,
    });
}
