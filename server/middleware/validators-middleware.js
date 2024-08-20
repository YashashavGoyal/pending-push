const validate = (schema) => async (req, res, next) => {
    try {
        const parsedBody = await schema.parseAsync(req.body);
        req.body = parsedBody;
        next();
    } catch (err) {
        // console.error('validate error', error);
        return res.status(400)
            .json({  message: err.errors[0].message })
    }
}

module.exports = validate;