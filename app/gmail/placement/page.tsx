import { EmailList } from '@/components/gmail/email-list'

export default function PlacementEmailsPage() {
  return (
    <div className="container mx-auto p-6">
      <EmailList 
        placement 
        title="Placement Emails" 
      />
    </div>
  )
}
