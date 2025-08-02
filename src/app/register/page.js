import RegisterView from "./RegisterView"

export const metadata = {
  title: `Login | ${process.env.NEXT_PUBLIC_COMPANY_NAME}`,
  description: 'Sign in',
}

export default function LoginPageWrapper() {
  return <RegisterView/>
}
