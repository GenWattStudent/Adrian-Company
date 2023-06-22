function cookieExtractor(req: any) {
  let token = null
  if (req && req.cookies) {
    token = req.cookies['access_token']
  }
  return token
}

export default cookieExtractor
