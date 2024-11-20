const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

const client = new SecretManagerServiceClient()

const getSecret = async (secretName) => {
    try {
        const projectId = 'catat-arey'

        const [ version ] = await client.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretName}/versions/latest`
        })
        
        const secretPayload = version.payload.data.toString('utf8')

        return secretPayload
    } catch (error) {
        console.error(`Error accessing secret: ${error}`)
        throw error
    }
}

module.exports = getSecret

