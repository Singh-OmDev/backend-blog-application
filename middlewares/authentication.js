const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName]; // Fixed: square brackets
        
        if (!tokenCookieValue) {
            return next(); // No token, continue without user
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload; // Attach user to request
        } catch (error) {
            // Token is invalid - clear the bad cookie
            console.log("Token validation error:", error.message);
            res.clearCookie(cookieName);
            // Continue without user attached
        }

        next(); // Always call next to continue
    };
}

module.exports = {
    checkForAuthenticationCookie
};