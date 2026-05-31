/** Auth proxy + session UI only run in local development. */
export const authEnabled = process.env.NODE_ENV === 'development'
