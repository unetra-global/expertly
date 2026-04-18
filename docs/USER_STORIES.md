

# USER STORIES — Expertly Platform
> Version 1.0
> This file contains all user stories for the Expertly platform.
> Each section maps to the corresponding MASTER_TDD.md section number.
> Load only the sections relevant to your current Claude Code session.
>
> User Types:
> - Guest: unauthenticated visitor
> - User: authenticated, not yet a member
> - Member: verified professional with active membership
> - Ops: internal team member (ops or backend_admin role)

---

## US-01 — Guest Experience
> Relevant TDD sections: Section 1, Section 21, Section 25

### US-01-01: Discovering Expertly for the first time
```
As a finance or legal professional who has heard about Expertly,
I want to understand what the platform is and who is on it,
So that I can decide whether to apply for membership.

Acceptance criteria:
✅ I land on a homepage that clearly explains what Expertly is
✅ I can see featured members with their name, designation, and service
✅ I can see recently published articles
✅ I can see upcoming events
✅ I can click on an article and read it fully without logging in
✅ I can see a "Apply for membership" call to action
✅ The page loads in under 2 seconds
✅ The page looks professional and premium — not generic
```

### US-01-02: Browsing the member directory as a guest
```
As a potential client looking for a finance or legal professional,
I want to browse available experts without creating an account,
So that I can see if the platform has the right kind of professionals.

Acceptance criteria:
✅ I can see member cards showing name, designation, service, city, country
✅ I can see the verified badge and member tier on each card
✅ I can see the member's profile photo
✅ After 20 results I see a prompt: "Sign in to see more professionals"
✅ I cannot see headline, fee range, or contact options without signing in
✅ I can filter by service type and country
✅ I can click a member card and see their public profile
✅ I cannot send a consultation request — I see "Sign in to contact"
```

### US-01-03: Reading a published article as a guest
```
As a business owner looking for professional advice,
I want to read articles written by finance and legal experts,
So that I can learn from them and evaluate their expertise.

Acceptance criteria:
✅ I can read the full article without logging in
✅ I can see the author's name, designation, and profile photo
✅ Clicking the author's name takes me to their profile
✅ I can see related articles at the bottom
✅ I can see the read time and publication date
✅ I see a disclaimer at the bottom of every article
✅ I see a call to action: "Want to connect with this expert? Sign in"
✅ The article is indexed by Google (Schema.org Article markup present)
```

### US-01-04: Finding Expertly on Google
```
As someone searching for "transfer pricing consultant India" on Google,
I want to find relevant Expertly member profiles and articles,
So that I discover the platform through organic search.

Acceptance criteria:
✅ Member profile pages appear in Google search results
✅ Article pages appear in Google search results
✅ Each page has a meaningful meta title and meta description
✅ Member profiles have Schema.org Person markup
✅ Articles have Schema.org Article markup
✅ Sitemap is accessible at /sitemap.xml
✅ robots.txt allows crawling of public pages
✅ robots.txt disallows /ops, /member, /application
```

---

## US-02 — Signup and Authentication
> Relevant TDD sections: Section 13

### US-02-01: Signing up with LinkedIn
```
As a finance professional who wants to join Expertly,
I want to sign up using my LinkedIn account,
So that my professional details are already available without manual entry.

Acceptance criteria:
✅ I see a "Sign in with LinkedIn" button on the auth page
✅ Clicking it takes me to LinkedIn to authorise
✅ After authorising, I am redirected back to Expertly automatically
✅ My name and profile photo are imported from LinkedIn
✅ If I am a new user, I land on the homepage (not onboarding)
✅ If I already have a draft application, I am taken to /application
✅ If I am already a member, I am taken to /member/dashboard
✅ If I am ops, I am taken to /ops
✅ The whole flow takes under 5 seconds
```

### US-02-02: Cancelling LinkedIn OAuth
```
As a visitor who accidentally clicked "Sign in with LinkedIn",
I want to cancel the authorisation,
So that I return to Expertly without being logged in.

Acceptance criteria:
✅ If I click Cancel on LinkedIn, I am returned to the Expertly homepage
✅ I am NOT logged in — I remain a guest
✅ I do NOT see an error message
✅ I can continue browsing as normal
```

### US-02-03: Returning to where I was after login
```
As a guest who clicked "Sign in to contact this expert",
I want to be taken back to that expert's profile after I log in,
So that I do not have to find the profile again.

Acceptance criteria:
✅ The URL I was trying to visit is preserved in sessionStorage
✅ After login, I am redirected to that URL automatically
✅ The returnTo URL is cleared from sessionStorage after redirect
✅ If the returnTo URL is invalid or expired, I land on the homepage
```

### US-02-04: Account suspended
```
As a user whose account has been suspended by ops,
I want to see a clear message when I try to log in,
So that I understand why I cannot access the platform.

Acceptance criteria:
✅ I am redirected to /auth?error=account_suspended
✅ I see a message: "Your account has been suspended. 
   Contact support@expertly.net for assistance."
✅ I am NOT logged in
✅ The support email is clickable
```

---

## US-03 — Applying for Membership (Onboarding)
> Relevant TDD sections: Section 22

### US-03-01: Starting an application
```
As an authenticated user who wants to become a member,
I want to start my membership application,
So that I can join the verified professional network.

Acceptance criteria:
✅ I can click "Apply for membership" from the homepage or navbar
✅ I am taken to /onboarding
✅ I see a clear 3-step progress indicator
✅ I understand what information I will need before I start
✅ My existing LinkedIn data is available to pre-fill the form
✅ If I already have a draft application, I am taken to /application to resume it
✅ If my application is already submitted, I see a message saying it is under review
```

### US-03-02: Importing my LinkedIn profile
```
As an applicant filling in Step 1,
I want to import my LinkedIn profile data automatically,
So that I do not have to type everything from scratch.

Acceptance criteria:
✅ I see an "Import from LinkedIn" button
✅ Clicking it shows a consent dialog explaining what data will be fetched
✅ After I agree, a loading indicator appears
✅ Within 2 minutes, my form fields are populated with LinkedIn data
✅ Only empty fields are populated — my manual entries are NOT overwritten
✅ I see a toast: "LinkedIn data imported. Review your details below."
✅ I can edit any pre-filled field before proceeding
✅ If LinkedIn import fails, I see: "Could not fetch LinkedIn data. 
   Please fill in your details manually." — the form is unchanged
```

### US-03-03: Completing Step 1 — Identity
```
As an applicant on Step 1,
I want to provide my professional identity details,
So that ops and potential clients understand who I am.

Acceptance criteria:
✅ I can upload a profile photo (JPEG/PNG, max 5MB)
✅ My photo is cropped to a square and previewed immediately
✅ I must enter: designation, headline (max 120 chars), bio (max 500 chars)
✅ LinkedIn URL is optional
✅ I can see a live character count on headline and bio
✅ I cannot proceed to Step 2 if required fields are empty
✅ Clicking Next saves my progress automatically
✅ If I close the browser and return, my progress is preserved
```

### US-03-04: Completing Step 2 — Experience
```
As an applicant on Step 2,
I want to provide my professional experience and qualifications,
So that ops can verify my credentials and tier assignment.

Acceptance criteria:
✅ I can enter: years of experience, firm name, firm size, country, city
✅ I can enter consultation fee range (min and max in USD)
✅ I can add qualifications as text tags (e.g. "CA", "LLB")
✅ I can upload credential documents (PDF/image, max 5, each max 10MB)
✅ Each credential requires: name, institution, year
✅ I can add work experience entries (max 5) with title, company, dates
✅ I can add education entries (max 3) with institution, degree, years
✅ I cannot proceed to Step 3 if required fields are empty
✅ My uploads show a progress indicator and confirm when complete
```

### US-03-05: Completing Step 3 — Services and Submitting
```
As an applicant on Step 3,
I want to select my services and confirm my availability,
So that I am matched to the right seat and discoverable by the right clients.

Acceptance criteria:
✅ I must select one primary service from the taxonomy list
✅ I can optionally select up to 3 secondary services
✅ I can add professional engagements (speaking, publications, awards — max 5)
✅ I can set my availability (days, time slots, timezone, response time)
✅ I must check both consent checkboxes before submitting
✅ I can see the full application summary before submitting
✅ Clicking Submit sends my application and shows a confirmation screen
✅ I receive a confirmation email (K1 sent to ops, K-equivalent sent to me)
✅ I am redirected to /application/status
```

### US-03-06: Leaving and returning to a draft application
```
As an applicant who started but did not finish,
I want to return to my in-progress application,
So that I do not have to start from scratch.

Acceptance criteria:
✅ When I log back in, I am taken directly to /application
✅ All my previously entered data is preserved exactly
✅ I can see which step I was on
✅ I can go back to previous steps and edit them
✅ The progress indicator shows which steps are complete
```

---

## US-04 — Application Status and Waiting
> Relevant TDD sections: Section 18

### US-04-01: Checking my application status
```
As an applicant who has submitted their application,
I want to see the current status of my application,
So that I know what to expect and when.

Acceptance criteria:
✅ I can see my application status at /application/status
✅ Statuses shown clearly: Submitted, Under Review, Approved, 
   Rejected, Waitlisted
✅ Each status has a human-readable explanation
✅ I can see when I submitted my application
✅ Under Review shows: "Our team will review within 5 business days"
✅ Approved shows: "Congratulations! Check your email for next steps."
✅ I do not see a loading spinner indefinitely — status loads in under 2s
```

### US-04-02: Being waitlisted
```
As an applicant whose preferred service has no available seats,
I want to understand that I am on a waitlist,
So that I know I will be notified when a spot opens.

Acceptance criteria:
✅ I see status: "You're on the waitlist"
✅ I see: "We will email you as soon as a seat becomes available 
   for your service."
✅ I received a K4 email explaining the waitlist
✅ When a seat opens, I receive a K5 email notification
```

### US-04-03: Being rejected
```
As an applicant whose application was not approved,
I want to understand why and what my options are,
So that I can either improve my application or seek alternatives.

Acceptance criteria:
✅ I see status: "Application not approved"
✅ I see the rejection reason provided by ops
✅ I see: "You may re-apply after [date 6 months from rejection]"
✅ If I am past the 6 month period, I see a "Re-apply" button
✅ Re-applying pre-fills my previous application data
✅ I received a K3 email with the rejection reason
✅ The rejection reason is respectful and constructive
```

### US-04-04: Application approved, awaiting payment
```
As an applicant whose application has been approved,
I want to know exactly how to complete my membership,
So that I can make the payment and get activated.

Acceptance criteria:
✅ I received a K2 email with bank transfer details
✅ The email includes: bank name, account number, sort code, 
   amount, and my unique reference code
✅ The email says: "Your account will be activated within 
   1 business day after payment confirmation"
✅ On /application/status I see: "Your application is approved. 
   Please check your email for payment instructions."
✅ The support email is visible in case I have questions
```

---

## US-05 — Member Activation
> Relevant TDD sections: Section 18

### US-05-01: Being activated as a member
```
As an approved applicant who has made payment,
I want to be activated as a member,
So that I can access the member portal and be discoverable.

Acceptance criteria:
✅ I receive a K17 welcome email when ops activates my account
✅ The welcome email includes my membership expiry date
✅ When I next log in, I am taken to /member/dashboard
✅ My public profile is live at /members/my-slug
✅ I am visible in the member directory
✅ I can immediately start creating articles and managing my profile
✅ My notification preferences are set to all enabled by default
✅ I am automatically subscribed to my primary service category digest
```

### US-05-02: My public profile after activation
```
As a newly activated member,
I want my public profile to look professional immediately,
So that potential clients can find and contact me.

Acceptance criteria:
✅ My profile is live at /members/{first-name}-{last-name}
✅ It shows everything I submitted in my application
✅ My profile photo is displayed (resized, not distorted)
✅ My primary service, country, and city are shown
✅ My consultation fee range is shown
✅ A "Request Consultation" button is visible to authenticated users
✅ Guests see "Sign in to contact this expert"
✅ My profile is indexed by Google within 24 hours
```

---

## US-06 — Member Profile Management
> Relevant TDD sections: Section 23

### US-06-01: Editing my profile
```
As an active member,
I want to keep my profile up to date,
So that it accurately reflects my current expertise and availability.

Acceptance criteria:
✅ I can edit all profile sections from /member/profile
✅ Changes are saved when I click Save (not auto-saved)
✅ I see a success toast when changes are saved
✅ My public profile reflects changes within 5 minutes
✅ I can upload a new profile photo at any time
✅ My old photo is replaced (not duplicated in storage)
```

### US-06-02: Losing my verified badge when I edit sensitive fields
```
As a verified member who has updated my bio,
I want to understand why my verified badge was removed,
So that I know what I need to do to get it back.

Acceptance criteria:
✅ When I edit headline, bio, designation, qualifications, 
   credentials, work experience, or education — my badge is removed
✅ I receive a K11 email explaining which fields I changed
✅ The email explains that ops will re-verify my profile
✅ On my dashboard I see: "Verified badge pending re-review"
✅ Ops can see me in their re-verification queue
✅ When ops re-awards my badge, I receive a K12 email
✅ Non-sensitive fields (city, availability, fee range) 
   do NOT trigger badge removal
```

### US-06-03: Requesting a service change
```
As a member who has expanded into a new practice area,
I want to change my primary service,
So that I appear in searches for my new specialty.

Acceptance criteria:
✅ I can select a new primary service from my profile
✅ I see: "Service change requests are reviewed by our team"
✅ My current service remains active until ops approves the change
✅ If approved, I receive a K19 email
✅ If rejected, I receive a K20 email with the reason
✅ If approved, my verified badge is removed pending re-verification
   (new service requires fresh credential review)
✅ The seat in my new service is claimed only when approved
```

### US-06-04: Uploading credential documents
```
As a member who wants to get the verified badge,
I want to upload my qualification certificates,
So that ops can verify my credentials.

Acceptance criteria:
✅ I can upload documents (PDF or image, max 10MB each)
✅ Each upload requires: credential name, institution, year
✅ I see a confirmation when each document is uploaded
✅ I can upload up to 5 credential documents
✅ Documents are private — only I and ops can view them
✅ After uploading, I see: "Your credentials are pending verification"
✅ Ops sees my credential documents in their review queue
```

---

## US-07 — Writing and Publishing Articles
> Relevant TDD sections: Section 19, Section 23

### US-07-01: Creating a new article
```
As an active member,
I want to write and publish articles about my area of expertise,
So that I demonstrate my knowledge and attract potential clients.

Acceptance criteria:
✅ I can create a new article from /member/articles/new
✅ I have a rich text editor with: headings, bold, italic, 
   links, bullet lists, numbered lists, images, blockquotes
✅ I can see a live word count in the toolbar
✅ I cannot submit until I have at least 300 words
✅ The maximum word count is 5000 words
✅ My draft is auto-saved every 30 seconds
✅ I see "Saved" in the toolbar when auto-save completes
✅ If I close the browser, my draft is preserved when I return
```

### US-07-02: Uploading a featured image
```
As a member writing an article,
I want to add a featured image to my article,
So that it looks professional when shared and listed.

Acceptance criteria:
✅ I can upload a featured image (JPEG/PNG, max 5MB)
✅ The image is previewed immediately after upload
✅ The image is resized to max 1200px wide automatically
✅ I cannot submit the article without a featured image
✅ I can replace the image at any time before submission
✅ The image appears as the article thumbnail in the listing
```

### US-07-03: Adding tags to my article
```
As a member writing an article,
I want to add relevant tags,
So that my article is categorised correctly and easily discoverable.

Acceptance criteria:
✅ I can type tags freely (not restricted to a fixed list)
✅ Tags are automatically lowercased
✅ I can add a maximum of 5 tags
✅ Each tag is max 30 characters
✅ I can remove tags by clicking the X on each tag
✅ If I used AI generation, suggested tags are pre-filled
   and I can edit them
```

### US-07-04: Submitting an article for review
```
As a member who has finished writing,
I want to submit my article for ops review,
So that it can be published on the platform.

Acceptance criteria:
✅ Submit button is disabled until all requirements are met:
   title, 300+ words, featured image, category
✅ Clicking Submit shows a confirmation dialog
✅ After submission I see: "Your article is under review. 
   We will notify you within 2 business days."
✅ The article appears in my articles list with status "Under Review"
✅ I cannot edit the article while it is under review
✅ I cannot submit more than 2 articles simultaneously
✅ If I already have 2 under review, Submit is disabled with explanation
```

### US-07-05: Article rejected by ops
```
As a member whose article was rejected,
I want to understand why and be able to improve it,
So that I can resubmit a better version.

Acceptance criteria:
✅ I receive a K10 email with the rejection reason
✅ The article appears in my list with status "Rejected"
✅ I can click Edit to open the article and revise it
✅ The rejection reason is shown inside the editor
✅ After editing I can resubmit for review
✅ The resubmitted article goes back to "Under Review" status
```

### US-07-06: Article published
```
As a member whose article was approved,
I want to see it live on the platform,
So that it reaches potential clients and demonstrates my expertise.

Acceptance criteria:
✅ I receive a K9 email: "Your article has been published!"
✅ The email includes a link to the live article
✅ The article is accessible at /articles/{slug}
✅ My name and profile link appear in the byline
✅ A disclaimer appears at the bottom of my article
✅ The article appears in the articles listing
✅ The article is indexed by Google
✅ Related articles are shown at the bottom
```

---

## US-08 — AI Article Generation
> Relevant TDD sections: Section 19

### US-08-01: Generating an article with AI assistance
```
As a member who wants to write an article but is short on time,
I want to use AI to generate a draft based on my answers,
So that I have a quality starting point I can edit and publish.

Acceptance criteria:
✅ I can click "Generate with AI" from the article editor
✅ I am shown 5-8 guided questions relevant to my service category
✅ I answer the questions in plain text
✅ I click Generate and see the text appear in real time (streaming)
✅ The full article (title, body, tags) is generated within 60 seconds
✅ The article is written in professional first-person language
✅ I can edit every part of the generated article
✅ The article is marked "AI-assisted" in the ops review panel
✅ I still need to add a featured image and submit for review
```

### US-08-02: AI generation fails or times out
```
As a member using AI generation whose request failed,
I want to understand what happened,
So that I can try again or write manually.

Acceptance criteria:
✅ If generation fails, I see: "AI generation failed. 
   Please try again or write your article manually."
✅ Any partial text in the editor is cleared
✅ My previous manual draft (if any) is NOT lost
✅ I can click Generate again to retry
✅ I can close the AI panel and write manually instead
```

---

## US-09 — Requesting a Consultation
> Relevant TDD sections: Section 12 (consultation endpoints)

### US-09-01: Sending a consultation request
```
As an authenticated user who wants professional advice,
I want to send a consultation request to a member,
So that they can get in touch with me about my needs.

Acceptance criteria:
✅ I can click "Request Consultation" on a member's profile
✅ I see a form with: subject (required), description, preferred time
✅ The service is pre-selected based on the member's primary service
✅ After submitting, I see: "Your request has been sent. 
   The professional will contact you directly by email."
✅ I receive a K7 confirmation email
✅ The member receives a K6 email with my contact details
✅ The K6 email includes my email address so they can reply directly
✅ I cannot send a duplicate request to the same member within 7 days
```

### US-09-02: Member receiving a consultation request
```
As a member who received a consultation request,
I want to see who sent it and be able to respond,
So that I can take on new client work.

Acceptance criteria:
✅ I receive a K6 email immediately when a request is sent
✅ The email shows: requester name, email, subject, description,
   preferred time, and the service they need help with
✅ I can reply directly to the email (MVP: no in-app response)
✅ I can see all received requests at /member/dashboard
✅ Each request shows: requester name, date, subject, status
✅ I cannot see requests from members — only from users and guests
   (guests cannot send requests — must log in first)
```

---

## US-10 — Member Dashboard and Settings
> Relevant TDD sections: Section 23

### US-10-01: Viewing my dashboard
```
As an active member,
I want a clear overview of my activity on Expertly,
So that I can see how my profile is performing.

Acceptance criteria:
✅ I see: profile completion percentage
✅ I see: number of published articles
✅ I see: total article views (all time)
✅ I see: consultation requests received in the last 30 days
✅ I see: my membership expiry date
✅ I see: verified badge status (awarded / pending re-review / not awarded)
✅ I see: my 3 most recent consultation requests
✅ I see: my 3 most recent articles with their status
✅ I see quick action buttons: Write Article, Edit Profile, View Public Profile
```

### US-10-02: Managing notification preferences
```
As a member,
I want to control which emails I receive from Expertly,
So that I only get the notifications that matter to me.

Acceptance criteria:
✅ I can toggle each notification type on/off:
   - Consultation request emails
   - Article status updates (approved/rejected)
   - Membership reminders (30 days before expiry)
   - Regulatory update nudges
   - Platform updates
✅ Changes are saved immediately
✅ Turning off membership reminders does NOT stop the expiry 
   notice — that is mandatory
✅ Turning off consultation requests means I do NOT receive K6 emails
```

### US-10-03: Managing digest subscriptions
```
As a member who wants to stay informed,
I want to subscribe to weekly content digests,
So that I receive curated articles from my areas of interest.

Acceptance criteria:
✅ I can subscribe to any service category digest
✅ I can choose weekly or fortnightly frequency per category
✅ I am automatically subscribed to my primary service category on activation
✅ I can unsubscribe from any digest at any time
✅ Digest emails arrive on Monday mornings
✅ If there are no new articles that week, I do NOT receive an empty digest
```

---

## US-11 — Membership Renewal
> Relevant TDD sections: Section 18

### US-11-01: Receiving a renewal reminder
```
As a member whose membership is expiring soon,
I want to be reminded in advance,
So that I have time to renew before I lose access.

Acceptance criteria:
✅ I receive a K13 email exactly 30 days before my expiry date
✅ The email clearly states my expiry date
✅ The email includes instructions to contact ops to renew:
   "Reply to this email or contact ops@expertly.net to renew"
✅ The email includes the bank transfer details for payment
✅ My reference code is included: EXPERTLY-{firstName}-{lastName}
```

### US-11-02: Membership expires
```
As a member whose membership has expired without renewal,
I want to understand what has changed,
So that I know what access I have lost and how to get it back.

Acceptance criteria:
✅ I receive a K14 email on my expiry date
✅ I am downgraded to 'user' role automatically
✅ I can no longer access /member portal
✅ My public profile shows "This member is no longer active on Expertly"
✅ My consultation request button is hidden
✅ I am removed from the member directory listing
✅ My published articles remain live and attributed
✅ My seat is released (someone else can claim it)
✅ If I log in, I am taken to the homepage (not member dashboard)
```

### US-11-03: Renewing membership
```
As a former member who has paid for renewal,
I want my membership to be reactivated,
So that I can continue using the member portal.

Acceptance criteria:
✅ After ops confirms my payment, I receive a K22 email
✅ My membership expiry date is extended by 1 year
✅ My role is restored to 'member'
✅ I can access /member/dashboard again
✅ My profile is visible in the directory again
✅ My consultation button is restored
✅ I do NOT need to reapply — my existing profile is reactivated
```

---

## US-12 — Ops: Application Review
> Relevant TDD sections: Section 24, Section 18

### US-12-01: Reviewing the application queue
```
As an ops team member,
I want to see all pending applications in one view,
So that I can process them efficiently without missing any.

Acceptance criteria:
✅ I can see all applications with status: submitted, under_review
✅ Each row shows: applicant name, service requested, country, date submitted
✅ I can filter by: service, country, status
✅ I can sort by: submission date (newest first by default)
✅ The count of pending applications is shown in the navigation badge
✅ The badge updates in real time (or within 60 seconds)
✅ I can click any application to open its detail view
```

### US-12-02: Reviewing an individual application
```
As an ops team member reviewing an application,
I want to see all the information the applicant submitted,
So that I can make an informed approval decision.

Acceptance criteria:
✅ I see: full name, email, LinkedIn profile link
✅ I see: designation, country, city, bio, headline
✅ I see: years of experience, firm name, qualifications
✅ I see: credential documents (clickable to open/download)
✅ I see: work experience timeline
✅ I see: education history
✅ I see: service requested
✅ I see: seat availability for that service + country
   (e.g. "8/10 seats taken, 2 available")
✅ I can click the LinkedIn URL to verify their profile
```

### US-12-03: Approving an application
```
As an ops team member who has reviewed a strong application,
I want to approve it with the appropriate service and tier,
So that the applicant can make payment and become a member.

Acceptance criteria:
✅ I can select the service to assign (may differ from what they requested)
✅ I can select the tier: Budding Entrepreneur or Seasoned Professional
✅ I can add optional internal notes
✅ I click Approve and see a confirmation dialog
✅ The system checks seat availability before confirming
✅ If no seats available, I see: "No seats available. 
   You must waitlist this applicant."
✅ After approving, the applicant receives the K2 email with payment details
✅ The application moves to status: approved
✅ I cannot approve my own application
```

### US-12-04: Rejecting an application
```
As an ops team member who has reviewed an unsuitable application,
I want to reject it with a clear reason,
So that the applicant understands why and can improve.

Acceptance criteria:
✅ I must provide a rejection reason (minimum 20 characters)
✅ I click Reject and see a confirmation dialog
✅ After rejecting, the applicant receives a K3 email with the reason
✅ The re_application_eligible_at date is set to 6 months from today
✅ The application moves to status: rejected
✅ The reason I wrote appears in the applicant's status page
```

### US-12-05: Waitlisting an application
```
As an ops team member with no available seats,
I want to waitlist a qualified applicant,
So that they are notified automatically when a seat opens.

Acceptance criteria:
✅ I click Waitlist and confirm
✅ The applicant receives a K4 email explaining the waitlist
✅ The application moves to status: waitlisted
✅ When ops increases seat capacity, 
   waitlisted applicants receive K5 email automatically
```

---

## US-13 — Ops: Member Management
> Relevant TDD sections: Section 24, Section 18

### US-13-01: Activating a member after payment
```
As an ops team member who has confirmed a payment,
I want to activate the member's account,
So that they can access the member portal.

Acceptance criteria:
✅ I navigate to the member's detail page in ops
✅ I click Activate Member
✅ I am asked to confirm the payment received date
✅ After confirming, the member is activated immediately
✅ The member receives K17 welcome email
✅ The member's profile goes live at /members/{slug}
✅ The seat is claimed in the seat allocation table
✅ I can see the payment date recorded on the member record
```

### US-13-02: Awarding the verified badge
```
As an ops team member who has reviewed a member's credentials,
I want to award them the verified badge,
So that clients can trust their qualifications.

Acceptance criteria:
✅ I can see all uploaded credential documents in the member detail view
✅ I can open/download each document
✅ For each credential I can enter: verified name, institution, year
✅ I click Verify on each credential to confirm it
✅ I click Award Verified Badge after reviewing all credentials
✅ The badge appears on the member's profile immediately
✅ The member receives a K12 email (or K11 if it was re-awarded)
✅ I can see the criteria guideline on the page:
   "Budding: < 10 years. Seasoned: 10+ years, established practice."
```

### US-13-03: Suspending a member
```
As an ops team member dealing with a policy violation,
I want to suspend a member's account,
So that they temporarily lose access while the issue is resolved.

Acceptance criteria:
✅ I click Suspend Member and must provide a reason
✅ After suspending, the member cannot access /member portal
✅ The member's public profile is hidden from the directory
✅ Their articles remain published (suspension is not deletion)
✅ The member's seat is NOT released (suspension is temporary)
✅ I can unsuspend at any time
✅ The suspension reason is recorded on the member record
```

### US-13-04: Approving a service change request
```
As an ops team member reviewing a service change,
I want to approve or reject it,
So that the member is assigned to the correct service.

Acceptance criteria:
✅ I can filter the members list by ?pendingServiceChange=true
✅ I can see the current service and requested service
✅ I can see seat availability for the requested service + country
✅ I click Approve Service Change
✅ The old seat is released and new seat claimed atomically
✅ The member's verified badge is removed (new service needs re-verification)
✅ The member receives K19 email
✅ If I reject, the member receives K20 email
```

---

## US-14 — Ops: Article Review
> Relevant TDD sections: Section 24, Section 19

### US-14-01: Reviewing the article queue
```
As an ops team member,
I want to see all articles pending review in one view,
So that I can process them without missing any.

Acceptance criteria:
✅ I see all articles with status: submitted, under_review
✅ Each row shows: title, author name, service category, date submitted, word count
✅ I can filter by: category, creation mode (manual/AI)
✅ The count appears in the navigation badge
✅ I click an article to open its full detail view
```

### US-14-02: Reviewing and approving an article
```
As an ops team member reviewing an article,
I want to read the full content before deciding,
So that I only publish accurate, professional content.

Acceptance criteria:
✅ I can read the full article rendered exactly as it will appear publicly
✅ I can see: word count, featured image, author verified status,
   creation mode (manual or AI-assisted)
✅ I CANNOT edit the article — read only
✅ I click Approve and the article is published immediately
✅ A disclaimer is appended to the article body automatically
✅ The author receives K9 email
✅ The article appears on /articles/{slug} within 5 minutes
```

### US-14-03: Rejecting an article
```
As an ops team member who found an issue with an article,
I want to reject it with a clear reason,
So that the author can fix the issue and resubmit.

Acceptance criteria:
✅ I must provide a rejection reason
✅ I click Reject and confirm
✅ The author receives K10 email with my reason
✅ The article returns to draft status
✅ The author can edit and resubmit
```

### US-14-04: Archiving a published article
```
As an ops team member who found a problem with a live article,
I want to immediately archive it,
So that incorrect or harmful content is removed from public view.

Acceptance criteria:
✅ I can click Archive on any published article
✅ I must provide a reason for archiving
✅ The article is removed from public view immediately
✅ The article URL returns a 404 page
✅ The author receives K21 email explaining the archive
✅ The article remains in the database (not deleted) for records
✅ The article appears in the author's list with status "Archived"
```

---

## US-15 — Ops: Seat and Event Management
> Relevant TDD sections: Section 24

### US-15-01: Managing seat allocations
```
As an ops team member,
I want to control how many members can be in each service + country,
So that we maintain quality and exclusivity on the platform.

Acceptance criteria:
✅ I can see a table of all service + country combinations
✅ Each row shows: service name, country, current count, max seats, 
   available seats, utilisation percentage
✅ Rows at 100% utilisation are highlighted with a warning
✅ I can edit the max seats for any allocation inline
✅ I can add a new service + country allocation
✅ Changing max seats upward automatically sends K5 to waitlisted applicants
   for that service + country
✅ I cannot set max seats below the current count
```

### US-15-02: Creating and managing events
```
As an ops team member,
I want to add finance and legal events to the platform,
So that members and users can discover relevant professional events.

Acceptance criteria:
✅ I can create an event with: title, description, organiser,
   event type, format, start/end datetime, timezone, 
   country, city, venue, registration URL, is_free flag
✅ I can add speakers to the event (name, designation, org)
✅ Events are saved as draft (not published) until I explicitly publish
✅ I can edit any event at any time
✅ I can delete an event that has not yet started
✅ Published events appear on /events automatically
✅ Past events (end_datetime < now) do not appear in the listing
```

---

## US-16 — Search and Discovery
> Relevant TDD sections: Section 12 (search endpoint)

### US-16-01: Searching for a member by name or keyword
```
As a user looking for a specific professional,
I want to search by name, keyword, or skill,
So that I can find the right expert quickly.

Acceptance criteria:
✅ I can see a search bar in the navigation
✅ As I type, results appear after 300ms (debounced)
✅ Results show members, articles, and events in dropdown
✅ I can click a result to go directly to that page
✅ Searching "transfer pricing" returns relevant members AND articles
✅ Search is semantic — "tax for startups" returns relevant results
   even without exact keyword match
✅ Guests see member name and designation (teaser only)
✅ Authenticated users see full member cards in results
```

### US-16-02: Filtering the member directory
```
As a user browsing for professionals,
I want to filter by service and country,
So that I find relevant experts without browsing everything.

Acceptance criteria:
✅ I can filter by: service (dropdown), country (dropdown)
✅ Filters work in combination (service AND country)
✅ Filter selections persist when I paginate
✅ Filter selections are reflected in the URL 
   (/members?service=transfer-pricing&country=IN)
✅ Sharing the filtered URL shows the same results to another user
✅ A "Clear filters" option resets to the full list
✅ The result count updates when filters are applied
```

---

## US-17 — Digest and Notifications
> Relevant TDD sections: Section 15 (scheduler)

### US-17-01: Receiving a weekly digest
```
As a user interested in finance and legal updates,
I want to receive a curated email of new articles,
So that I stay informed without having to check the website.

Acceptance criteria:
✅ I receive the digest on Monday mornings
✅ The digest contains only articles published in the past 7 days
✅ The digest is specific to the categories I subscribed to
✅ Each article shows: title, excerpt, author, read time, link
✅ If no new articles were published that week, I do NOT receive an email
✅ I can unsubscribe from any digest with one click
✅ The unsubscribe link works without requiring me to log in
```

### US-17-02: Receiving a regulatory nudge
```
As a member in a specific practice area,
I want to be notified of relevant regulatory changes,
So that I can write timely articles and stay current.

Acceptance criteria:
✅ When ops ingests a regulatory update relevant to my service category,
   I receive a K16 email
✅ The email contains: regulatory update title, summary, source link
✅ The email includes: "Write an article about this update"
   with a link to the article editor
✅ I only receive nudges for my primary service category
✅ I can turn off regulatory nudges in my notification preferences
```

---

## US-18 — Admin Functions
> Relevant TDD sections: Section 12 (admin endpoints)

### US-18-01: Managing user roles
```
As a backend_admin,
I want to change the role of any user,
So that I can onboard new ops team members or fix incorrect roles.

Acceptance criteria:
✅ I can see all users in the admin panel
✅ I can search by email or name
✅ I can change role to: user, member, ops, backend_admin
✅ I cannot demote another backend_admin
✅ I cannot change my own role
✅ Role changes take effect on the user's next login
✅ All role changes are logged with timestamp and who made the change
```

### US-18-02: Soft-deleting a user
```
As a backend_admin handling a GDPR deletion request,
I want to anonymise a user's personal data,
So that we comply with the request while preserving platform integrity.

Acceptance criteria:
✅ I can click Delete User on any user record
✅ I must provide a deletion reason
✅ The user's personal data is anonymised:
   email → deleted-{uuid}@deleted.expertly.net
   first_name → Deleted
   last_name → User
   avatar_url → null
✅ The user's Supabase auth account is deactivated (not deleted)
✅ The user cannot log in after deletion
✅ Consent logs and email logs are retained for legal compliance
✅ If the user was a member, their articles remain with "Former Member" attribution
✅ The action is irreversible and logged
```

### US-18-03: Sending a broadcast email
```
As a backend_admin,
I want to send an email to a specific audience,
So that I can communicate important updates or opportunities.

Acceptance criteria:
✅ I can select the audience:
   All Members, All Users, Waitlist (specific service + country),
   Expiring Soon (next 30 days)
✅ I can see the estimated recipient count before sending
✅ I write a subject and rich text body
✅ I must confirm before sending
✅ After sending, I can see the broadcast in the log:
   date, audience, subject, recipient count
✅ I cannot undo a broadcast after sending
✅ Only backend_admin can send broadcasts (not regular ops)
```

---

*USER_STORIES.md — End of Document*
*Version 1.0 | 18 Story Groups | 52 Individual Stories*
*Map to MASTER_TDD.md sections for technical implementation details.*
