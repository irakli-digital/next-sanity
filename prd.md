# Technical Implementation Plan
## Next.js + Sanity CMS Architecture

### Content Management Strategy

#### Dynamic Pages (Managed via Sanity CMS)
These pages will have content managed through Sanity Studio with real-time updates:

**Programs & Courses**
- `/programs` - Programs listing page (dynamic content)
- `/programs/[slug]` - Individual program pages (dynamic content)
- Content: Title, description, pricing, curriculum, enrollment options, multimedia content

**Books Store**
- `/books` - Books listing page (dynamic content) 
- `/books/[slug]` - Individual book pages (dynamic content)
- Content: Title, description, preview, pricing, author info, purchase options

**Blog & Resources**
- `/blog` - Blog listing page (dynamic content)
- `/blog/[slug]` - Individual blog posts (dynamic content)
- `/resources` - Resources hub (dynamic content)
- Content: Articles, downloads, video library, categories

**Events & Calendar**
- `/events` - Events listing page (dynamic content)
- `/events/[slug]` - Individual event pages (dynamic content)
- Content: Webinars, workshops, live sessions, registration

**Video Gallery**
- `/videos` - Video gallery (dynamic content)
- `/videos/[slug]` - Individual video pages (dynamic content)
- Content: Organized by categories, access controls, descriptions

#### Static Pages (Code-based)
These pages will be built as static components with minimal CMS integration:

**Core Pages**
- `/` - Homepage (hybrid: hero content from CMS, structure static)
- `/about` - About page (content from CMS, layout static)
- `/contact` - Contact page (static form, contact info from CMS)

**User Account System**
- `/login` - User authentication (static)
- `/register` - User registration (static)
- `/dashboard` - User dashboard (static layout, dynamic user data)
- `/dashboard/purchases` - Purchase history (static)
- `/dashboard/courses` - Enrolled courses (static)

**E-commerce Pages**
- `/cart` - Shopping cart (static functionality)
- `/checkout` - Checkout process (static)
- `/checkout/success` - Purchase confirmation (static)
- `/checkout/cancel` - Purchase cancellation (static)

### Sanity Schema Architecture

#### Core Content Types

**1. Program Schema**
```typescript
{
  name: 'program',
  title: 'Program',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'description', type: 'text' },
    { name: 'fullDescription', type: 'blockContent' },
    { name: 'ageGroup', type: 'string' },
    { name: 'price', type: 'number' },
    { name: 'duration', type: 'string' },
    { name: 'curriculum', type: 'array', of: [{ type: 'block' }] },
    { name: 'mainImage', type: 'image' },
    { name: 'gallery', type: 'array', of: [{ type: 'image' }] },
    { name: 'featured', type: 'boolean' },
    { name: 'category', type: 'reference', to: [{ type: 'programCategory' }] },
    { name: 'instructor', type: 'reference', to: [{ type: 'instructor' }] },
    { name: 'enrollmentOptions', type: 'object' },
    { name: 'seo', type: 'seo' }
  ]
}
```

**2. Book Schema**
```typescript
{
  name: 'book',
  title: 'Book',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'description', type: 'text' },
    { name: 'fullDescription', type: 'blockContent' },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'price', type: 'number' },
    { name: 'isbn', type: 'string' },
    { name: 'pages', type: 'number' },
    { name: 'coverImage', type: 'image' },
    { name: 'previewFile', type: 'file' },
    { name: 'digitalFile', type: 'file' },
    { name: 'featured', type: 'boolean' },
    { name: 'category', type: 'reference', to: [{ type: 'bookCategory' }] },
    { name: 'seo', type: 'seo' }
  ]
}
```

**3. Blog Post Schema**
```typescript
{
  name: 'blogPost',
  title: 'Blog Post',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'excerpt', type: 'text' },
    { name: 'body', type: 'blockContent' },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'mainImage', type: 'image' },
    { name: 'categories', type: 'array', of: [{ type: 'reference', to: [{ type: 'category' }] }] },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'featured', type: 'boolean' },
    { name: 'seo', type: 'seo' }
  ]
}
```

**4. Event Schema**
```typescript
{
  name: 'event',
  title: 'Event',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'description', type: 'text' },
    { name: 'fullDescription', type: 'blockContent' },
    { name: 'eventDate', type: 'datetime' },
    { name: 'endDate', type: 'datetime' },
    { name: 'eventType', type: 'string', options: { list: ['webinar', 'workshop', 'live-session'] } },
    { name: 'isOnline', type: 'boolean' },
    { name: 'location', type: 'string' },
    { name: 'price', type: 'number' },
    { name: 'maxParticipants', type: 'number' },
    { name: 'instructor', type: 'reference', to: [{ type: 'instructor' }] },
    { name: 'mainImage', type: 'image' },
    { name: 'featured', type: 'boolean' },
    { name: 'seo', type: 'seo' }
  ]
}
```

**5. Video Schema**
```typescript
{
  name: 'video',
  title: 'Video',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'description', type: 'text' },
    { name: 'videoUrl', type: 'url' },
    { name: 'thumbnail', type: 'image' },
    { name: 'duration', type: 'string' },
    { name: 'category', type: 'reference', to: [{ type: 'videoCategory' }] },
    { name: 'accessLevel', type: 'string', options: { list: ['free', 'premium', 'course-only'] } },
    { name: 'featured', type: 'boolean' },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'seo', type: 'seo' }
  ]
}
```

#### Supporting Schemas

**6. Site Settings Schema**
```typescript
{
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'description', type: 'text' },
    { name: 'logo', type: 'image' },
    { name: 'favicon', type: 'image' },
    { name: 'contactInfo', type: 'object' },
    { name: 'socialMedia', type: 'object' },
    { name: 'seo', type: 'seo' }
  ]
}
```

**7. Navigation Schema**
```typescript
{
  name: 'navigation',
  title: 'Navigation',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'menuItems', type: 'array', of: [{ type: 'menuItem' }] }
  ]
}
```

### Next.js Implementation Strategy

#### App Router Structure
```
src/app/
├── (website)/                 # Website routes
│   ├── page.tsx              # Homepage
│   ├── about/page.tsx        # About page
│   ├── contact/page.tsx      # Contact page
│   ├── programs/
│   │   ├── page.tsx          # Programs listing
│   │   └── [slug]/page.tsx   # Individual program
│   ├── books/
│   │   ├── page.tsx          # Books listing
│   │   └── [slug]/page.tsx   # Individual book
│   ├── blog/
│   │   ├── page.tsx          # Blog listing
│   │   └── [slug]/page.tsx   # Individual post
│   ├── events/
│   │   ├── page.tsx          # Events listing
│   │   └── [slug]/page.tsx   # Individual event
│   ├── videos/
│   │   ├── page.tsx          # Video gallery
│   │   └── [slug]/page.tsx   # Individual video
│   └── resources/page.tsx    # Resources hub
├── (auth)/                    # Authentication routes
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/               # User dashboard
│   └── dashboard/
│       ├── page.tsx          # Dashboard home
│       ├── purchases/page.tsx
│       └── courses/page.tsx
├── (commerce)/                # E-commerce routes
│   ├── cart/page.tsx
│   └── checkout/
│       ├── page.tsx
│       ├── success/page.tsx
│       └── cancel/page.tsx
├── (sanity)/                  # CMS routes
│   └── studio/page.tsx       # Sanity Studio
├── api/                       # API routes
│   ├── auth/                 # Authentication
│   ├── payments/             # Payment processing
│   ├── revalidate-tag/       # Cache revalidation
│   └── webhooks/             # External webhooks
├── globals.css
└── layout.tsx
```

#### Caching Strategy
- **Static Generation**: Homepage hero, about page structure
- **ISR (Incremental Static Regeneration)**: Programs, books, blog posts
- **Server-Side Rendering**: User dashboard, dynamic user content
- **Client-Side Rendering**: Shopping cart, interactive components

#### Performance Optimization
- **Image Optimization**: Sanity CDN + Next.js Image component
- **Code Splitting**: Route-based and component-based splitting
- **Caching**: Redis for session management and API responses
- **CDN**: Vercel Edge Network for global content delivery

### E-commerce Integration

#### Payment Gateway Integration
- **TBC Bank Integration**: Custom API integration for Georgian market
- **Stripe**: International payments backup
- **Digital Product Delivery**: Automated email delivery system
- **Invoice Generation**: PDF generation for purchases

#### Shopping Cart & Orders
- **Cart State Management**: Zustand or Context API
- **Order Processing**: Database storage with status tracking
- **Email Notifications**: Automated order confirmations
- **Admin Panel**: Order management through Sanity Studio

### Analytics & Marketing Integration

#### Google Analytics 4 Setup
- **Enhanced E-commerce**: Product views, add to cart, purchases
- **Custom Events**: Video plays, resource downloads, course enrollments
- **Conversion Goals**: Newsletter signups, contact form submissions
- **User Journey Tracking**: Multi-touch attribution

#### Facebook Pixel Integration
- **Standard Events**: PageView, ViewContent, AddToCart, Purchase
- **Custom Events**: Video engagement, resource downloads
- **Custom Audiences**: Website visitors, purchasers, engaged users
- **Lookalike Audiences**: Based on high-value customers

#### Email Marketing Integration
- **Mailchimp Integration**: Newsletter signup, automated sequences
- **Segmentation**: By purchase history, engagement level, program interest
- **Automation**: Welcome series, course reminders, promotional campaigns

### Security & Compliance

#### Data Protection
- **GDPR Compliance**: Cookie consent, data processing agreements
- **SSL Encryption**: Full site HTTPS implementation
- **User Data Security**: Encrypted storage, secure authentication
- **Payment Security**: PCI DSS compliance for payment processing

#### Authentication & Authorization
- **NextAuth.js**: Social login, email/password authentication
- **Role-Based Access**: Admin, instructor, student, guest roles
- **Protected Routes**: Course content, premium resources
- **Session Management**: Secure token handling

### Development Phases Implementation

#### Phase 1: Foundation & Core CMS (12 days)
1. **Days 1-3**: Project setup, Sanity schema creation
2. **Days 4-6**: Core page templates, navigation system
3. **Days 7-9**: Programs and books content management
4. **Days 10-12**: Basic e-commerce setup, payment integration

#### Phase 2: Advanced E-Commerce & Features (8 days)
1. **Days 1-2**: User authentication and dashboard
2. **Days 3-4**: Shopping cart and checkout process
3. **Days 5-6**: Video gallery and event calendar
4. **Days 7-8**: Email marketing and analytics integration

#### Phase 3: Optimization & Launch (4 days)
1. **Day 1**: Performance optimization, SEO implementation
2. **Day 2**: Security hardening, SSL setup
3. **Day 3**: Testing, debugging, mobile optimization
4. **Day 4**: Content migration, training, go-live

### Technical Stack Summary

**Frontend**
- Next.js 15 with App Router
- React 19 with Server Components
- Tailwind CSS for styling
- TypeScript for type safety

**Backend & CMS**
- Sanity CMS for content management
- Next.js API routes for custom functionality
- Database: Sanity Content Lake + PostgreSQL for user data

**E-commerce & Payments**
- TBC Bank payment gateway
- Stripe for international payments
- Custom order management system

**Analytics & Marketing**
- Google Analytics 4
- Google Tag Manager
- Facebook Pixel
- Mailchimp integration

**Hosting & Infrastructure**
- Vercel for deployment
- Sanity hosting for CMS
- CDN for global content delivery
- SSL certificate for security

This implementation plan provides a comprehensive roadmap for building the Amonashvili Academy platform using Next.js and Sanity CMS, ensuring scalability, performance, and ease of content management.

