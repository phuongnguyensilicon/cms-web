import { auth0SigninUrl } from "@services/auth0.service";

const signinHandler = (req: Request) => {
  const { searchParams } = new URL(req.url);
  const { connection = "", state = "" } = Object.fromEntries(
    searchParams.entries()
  );

  const origin = req.headers.get('origin');
  const callBackUrl = `${origin}/auth/callback`;
  return Response.redirect(
    auth0SigninUrl(connection.toString(), state.toString(), callBackUrl)
  );
};

export { signinHandler as GET, signinHandler as POST };
