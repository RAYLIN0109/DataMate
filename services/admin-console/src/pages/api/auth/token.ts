import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

const MOCK_TOKEN = 'admin@datamate.local'

const mockHandler = async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(MOCK_TOKEN)
}

const handler = withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { accessToken } = await getAccessToken(req, res)
      res.status(200).json(accessToken)
    } catch (error) {
      console.error('Error fetching access token:', error)

      // Redirect user to logout
      res.writeHead(302, {
        Location: '/api/auth/logout',
      })
      res.end()
    }
  },
)

export default process.env.AUTH_DISABLED === 'true' ? mockHandler : handler
