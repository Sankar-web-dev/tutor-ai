import { EmailList } from '@/components/gmail/email-list'

export default function PlacementEmailsPage() {
  return (
    <div className="container mx-auto p-6">
      <EmailList 
        query="placement OR job OR interview OR offer OR recruitment" 
        title="Placement Emails" 
      />
    </div>
  )
}
