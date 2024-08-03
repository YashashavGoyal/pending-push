const adminMiddleware = async (req, res, next) => {
    try {
        const user = req.user;
        const isAdmin = user.isAdmin;
        
        if (!isAdmin) {
            return res.status(401).json({message: "You are not authenticated To access the page"});
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500)
            .json({message: "Internal Server Error Can't Authenticate"});
    }
}

module.exports = adminMiddleware;