import DashboardView from "./Dashboard"

export const metadata = {
  title: `Dashboard | ${process.env.NEXT_PUBLIC_COMPANY_NAME}`,
  description: 'Dashboard',
}

export default function LoginPageWrapper() {
  return <DashboardView/>
}
