import { API_URL, AUTH } from '@/config'
import { serverFetcher } from '@/lib/api/server-fetcher'
import { User } from '@/models/api'
import {
  AfterCallback,
  HandlerError,
  Session,
  handleAuth,
  handleCallback,
  handleLogin,
} from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

/**
 * The signup and login will be handled by auth0. We would have to deal with both in the backend and do each flow depending on if the user exists or not.
 */
const afterCallback: AfterCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
) => {
  const { user: auth0User, accessToken: token } = session
  try {
    const user: User = await serverFetcher<User>(`${API_URL}/auth/login`, {
      body: JSON.stringify(auth0User),
      method: 'POST',
      token,
    })
    const sessionUser: User = {
      ...auth0User,
      ...user,
    }
    session.user = sessionUser
  } catch (e: unknown) {
    const error = e as Error
    console.error(error)
    res.writeHead(302, {
      Location: `/auth/error?message=${encodeURIComponent(e as string)}`,
    })
    res.end()
  }
  return session
}

const AUTH_DISABLED = process.env.AUTH_DISABLED === 'true'

const MOCK_USER = {
  sub: 'admin@datamate.local',
  email: 'admin@datamate.local',
  email_verified: true,
  name: '本地测试管理员',
  nickname: 'admin',
  picture: null,
  organization_id: null,
  updated_at: null,
}

/** 本地测试模式：不经过 Auth0，直接模拟登录会话 */
const mockHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const route = (req.query.auth0 as string[])?.[0]
  switch (route) {
    case 'me': {
      try {
        const user: User = await serverFetcher<User>(`${API_URL}/auth/login`, {
          body: JSON.stringify(MOCK_USER),
          method: 'POST',
          token: MOCK_USER.email,
        })
        res.json({ ...MOCK_USER, ...user })
      } catch (e) {
        console.error('Mock /me: enterprise login failed:', e)
        res.json(MOCK_USER)
      }
      return
    }
    case 'token':
      res.json(MOCK_USER.email)
      return
    case 'login':
      try {
        await serverFetcher<User>(`${API_URL}/auth/login`, {
          body: JSON.stringify(MOCK_USER),
          method: 'POST',
          token: MOCK_USER.email,
        })
      } catch (e) {
        console.error('Mock login to enterprise API failed:', e)
      }
      res.writeHead(302, { Location: '/' })
      res.end()
      return
    case 'logout':
    case 'callback':
      res.writeHead(302, { Location: '/' })
      res.end()
      return
    default:
      res.status(404).end()
  }
}

const auth0Handler = handleAuth({
  login: handleLogin({
    authorizationParams: {
      scope: AUTH.scope,
      audience: AUTH.audience,
    },
  }),
  signup: handleLogin({
    authorizationParams: {
      scope: AUTH.scope,
      audience: AUTH.audience,
      screen_hint: 'signup',
    },
  }),
  callback: handleCallback({ afterCallback }),
  onError(_: NextApiRequest, res: NextApiResponse, error: HandlerError) {
    console.error(error)
    res.writeHead(302, {
      Location: `/auth/error?message=${encodeURIComponent(error.message)}`,
    })
    res.end()
  },
})

export default AUTH_DISABLED ? mockHandler : auth0Handler
