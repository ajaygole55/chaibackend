class ApiResponse {
    constructor(statusCode, data, message = "success") {
        
        this.statusCode = statusCode,
        this.data = data,
        this.message = message,
        this.success = statusCode < 400
        console.log("APi Respionse Error")
    }
}
export { ApiResponse }