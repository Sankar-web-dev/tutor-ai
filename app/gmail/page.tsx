import { EmailList } from '@/components/gmail/email-list'

export default function GmailPage() {
  return (
    <div className="container mx-auto p-6">
      <EmailList title="All Emails" />
    </div>
  )
}
