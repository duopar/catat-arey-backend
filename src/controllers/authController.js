const register = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Registration successful.',
        data: null
    })
}

const login = (req, res) => {

}

const logout = (req, res) => {

}

module.exports = {
    register,
    login,
    logout
}