/**
 * generate-modules.mjs
 * 
 * One-shot generator for the remaining 37 NestJS CRUD modules.
 * Run:  node scripts/generate-modules.mjs
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MODULES_DIR = join(ROOT, 'backend', 'api', 'src', 'modules');
const APP_MODULE = join(ROOT, 'backend', 'api', 'src', 'app.module.ts');

// ─── Case helpers ──────────────────────────────────────────────────
const toPascal = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');
const toCamel  = s => { const p = toPascal(s); return p[0].toLowerCase() + p.slice(1); };
const toTitle  = s => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

// ─── Field helper ──────────────────────────────────────────────────
// F(name, type, required, description, ...extra)
// types: 'uuid','string','int','decimal','bool','date','json','string[]','enum:Name'
function F(name, type, required, desc, ...extra) {
  return { name, type, required, desc, extra };
}

// List filter helper
function LF(name, type, desc, ...extra) {
  return { name, type, desc, extra };
}

// ─── Module Definitions ────────────────────────────────────────────

const MODULES = [
  // ── Finance ──────────────────────────────────────────────────────
  {
    path: 'fee-structures',
    entity: 'FeeStructure',
    tag: 'Fee Structures',
    perm: 'fee-structures',
    searchFields: ['name'],
    sortFields: ['createdAt', 'name', 'totalAmount'],
    defaultSort: 'name',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',    'uuid',     true,  'Parent institute UUID.'),
      F('programId',      'uuid',     false, 'Program UUID.'),
      F('batchId',        'uuid',     false, 'Batch UUID.'),
      F('academicYearId', 'uuid',     true,  'Academic year UUID.'),
      F('termId',         'uuid',     false, 'Term UUID.'),
      F('name',           'string',   true,  'Fee structure name.', 200),
      F('description',    'string',   false, 'Description.', 1000),
      F('totalAmount',    'decimal',  true,  'Total fee amount.'),
      F('currency',       'string',   false, 'Currency code.', 10),
      F('componentsJson', 'json',     true,  'Fee components breakdown.'),
      F('dueDate',        'date',     false, 'Payment due date.'),
      F('status',         'enum:FeeStructureStatus', false, 'Fee structure status.'),
      F('effectiveFrom',  'date',     true,  'Effective start date.'),
      F('effectiveTo',    'date',     false, 'Effective end date.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('programId',   'uuid', 'Filter by program.'),
      LF('batchId',     'uuid', 'Filter by batch.'),
      LF('academicYearId', 'uuid', 'Filter by academic year.'),
      LF('status', 'enum:FeeStructureStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'invoices',
    entity: 'Invoice',
    tag: 'Invoices',
    perm: 'invoices',
    searchFields: ['invoiceNumber'],
    sortFields: ['createdAt', 'invoiceNumber', 'grandTotal', 'dueDate'],
    defaultSort: 'createdAt',
    uniqueCheck: { field: 'invoiceNumber', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',     'uuid',    true,  'Parent institute UUID.'),
      F('studentId',       'uuid',    true,  'Student UUID.'),
      F('feeStructureId',  'uuid',    false, 'Fee structure UUID.'),
      F('termId',          'uuid',    false, 'Term UUID.'),
      F('invoiceNumber',   'string',  true,  'Unique invoice number.', 64),
      F('status',          'enum:InvoiceStatus', false, 'Invoice status.'),
      F('subTotal',        'decimal', true,  'Sub total amount.'),
      F('discountTotal',   'decimal', false, 'Discount total.'),
      F('taxTotal',        'decimal', false, 'Tax total.'),
      F('grandTotal',      'decimal', true,  'Grand total.'),
      F('amountPaid',      'decimal', false, 'Amount paid so far.'),
      F('amountDue',       'decimal', true,  'Amount due.'),
      F('currency',        'string',  false, 'Currency code.', 10),
      F('issuedAt',        'date',    false, 'Date invoice was issued.'),
      F('dueDate',         'date',    false, 'Payment due date.'),
      F('lineItemsJson',   'json',    true,  'Invoice line items.'),
      F('notes',           'string',  false, 'Notes.', 1000),
      F('metadata',        'json',    false, 'Additional metadata.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('status', 'enum:InvoiceStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'payments',
    entity: 'Payment',
    tag: 'Payments',
    perm: 'payments',
    searchFields: ['paymentNumber'],
    sortFields: ['createdAt', 'paymentNumber', 'amount', 'paidAt'],
    defaultSort: 'createdAt',
    uniqueCheck: { field: 'paymentNumber', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',      'uuid',    true,  'Parent institute UUID.'),
      F('invoiceId',        'uuid',    false, 'Invoice UUID.'),
      F('studentId',        'uuid',    true,  'Student UUID.'),
      F('paymentNumber',    'string',  true,  'Unique payment number.', 64),
      F('method',           'enum:PaymentMethod', true, 'Payment method.'),
      F('status',           'enum:PaymentStatus', false, 'Payment status.'),
      F('amount',           'decimal', true,  'Payment amount.'),
      F('currency',         'string',  false, 'Currency code.', 10),
      F('gatewayName',      'string',  false, 'Payment gateway name.', 64),
      F('gatewayTxnId',     'string',  false, 'Gateway transaction ID.', 255),
      F('gatewayResponse',  'json',    false, 'Gateway response payload.'),
      F('paidAt',           'date',    false, 'Date payment was made.'),
      F('refundedAt',       'date',    false, 'Date of refund.'),
      F('refundAmount',     'decimal', false, 'Refund amount.'),
      F('receiptUrl',       'string',  false, 'Receipt download URL.', 500),
      F('receivedByUserId', 'uuid',    false, 'User who received payment.'),
      F('notes',            'string',  false, 'Notes.', 1000),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('invoiceId',   'uuid', 'Filter by invoice.'),
      LF('status', 'enum:PaymentStatus', 'Filter by status.'),
      LF('method', 'enum:PaymentMethod', 'Filter by method.'),
    ],
  },
  {
    path: 'scholarships',
    entity: 'Scholarship',
    tag: 'Scholarships',
    perm: 'scholarships',
    searchFields: ['name'],
    sortFields: ['createdAt', 'name', 'amount'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',        'uuid',    true,  'Parent institute UUID.'),
      F('studentId',          'uuid',    true,  'Student UUID.'),
      F('academicYearId',     'uuid',    true,  'Academic year UUID.'),
      F('name',               'string',  true,  'Scholarship name.', 200),
      F('sponsor',            'string',  false, 'Sponsoring body.', 200),
      F('amount',             'decimal', true,  'Scholarship amount.'),
      F('currency',           'string',  false, 'Currency code.', 10),
      F('status',             'enum:ScholarshipStatus', false, 'Scholarship status.'),
      F('disbursementMethod', 'string',  false, 'Disbursement method.', 64),
      F('documentsJson',      'json',    false, 'Supporting documents.'),
      F('remarks',            'string',  false, 'Remarks.', 1000),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('academicYearId', 'uuid', 'Filter by academic year.'),
      LF('status', 'enum:ScholarshipStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'wallets',
    entity: 'Wallet',
    tag: 'Wallets',
    perm: 'wallets',
    searchFields: [],
    sortFields: ['createdAt', 'balance'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId', 'uuid',    true,  'Parent institute UUID.'),
      F('studentId',   'uuid',    true,  'Student UUID (unique per student).'),
      F('balance',     'decimal', false, 'Wallet balance.'),
      F('holdAmount',  'decimal', false, 'Amount on hold.'),
      F('currency',    'string',  false, 'Currency code.', 10),
      F('status',      'enum:WalletStatus', false, 'Wallet status.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('status', 'enum:WalletStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'wallet-transactions',
    entity: 'WalletTransaction',
    tag: 'Wallet Transactions',
    perm: 'wallet-transactions',
    searchFields: ['reference'],
    sortFields: ['createdAt', 'amount'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',     'uuid',    true,  'Parent institute UUID.'),
      F('walletId',        'uuid',    true,  'Wallet UUID.'),
      F('paymentId',       'uuid',    false, 'Payment UUID.'),
      F('type',            'enum:WalletTxnType', true, 'Transaction type.'),
      F('amount',          'decimal', true,  'Transaction amount.'),
      F('balanceAfter',    'decimal', true,  'Balance after transaction.'),
      F('reference',       'string',  false, 'Reference code.', 255),
      F('description',     'string',  false, 'Description.', 500),
      F('metadata',        'json',    false, 'Additional metadata.'),
      F('createdByUserId', 'uuid',    false, 'User who created the transaction.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('walletId',    'uuid', 'Filter by wallet.'),
      LF('type', 'enum:WalletTxnType', 'Filter by transaction type.'),
    ],
  },
  {
    path: 'fee-waivers',
    entity: 'FeeWaiver',
    tag: 'Fee Waivers',
    perm: 'fee-waivers',
    searchFields: ['reason'],
    sortFields: ['createdAt', 'amount'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',       'uuid',    true,  'Parent institute UUID.'),
      F('studentId',         'uuid',    true,  'Student UUID.'),
      F('invoiceId',         'uuid',    false, 'Invoice UUID.'),
      F('amount',            'decimal', true,  'Waiver amount.'),
      F('reason',            'string',  true,  'Reason for waiver.', 1000),
      F('status',            'enum:WaiverStatus', false, 'Waiver status.'),
      F('requestedByUserId', 'uuid',    true,  'User who requested the waiver.'),
      F('approvedByUserId',  'uuid',    false, 'User who approved the waiver.'),
      F('approvedAt',        'date',    false, 'Approval date.'),
      F('remarks',           'string',  false, 'Remarks.', 1000),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('status', 'enum:WaiverStatus', 'Filter by status.'),
    ],
  },

  // ── Documents & Certificates ─────────────────────────────────────
  {
    path: 'documents',
    entity: 'Document',
    tag: 'Documents',
    perm: 'documents',
    searchFields: ['title'],
    sortFields: ['createdAt', 'title', 'category'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',  'uuid',     true,  'Parent institute UUID.'),
      F('ownerUserId',  'uuid',     false, 'Document owner user UUID.'),
      F('category',     'enum:DocumentCategory', true, 'Document category.'),
      F('title',        'string',   true,  'Document title.', 255),
      F('description',  'string',   false, 'Description.', 1000),
      F('fileObjectId', 'uuid',     true,  'File object UUID.'),
      F('isPublic',     'bool',     false, 'Whether the document is public.'),
      F('tags',         'string[]', false, 'Tags.'),
      F('expiresAt',    'date',     false, 'Expiry date.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('ownerUserId', 'uuid', 'Filter by owner.'),
      LF('category', 'enum:DocumentCategory', 'Filter by category.'),
    ],
  },
  {
    path: 'certificates',
    entity: 'Certificate',
    tag: 'Certificates',
    perm: 'certificates',
    searchFields: ['certificateNumber'],
    sortFields: ['createdAt', 'type', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',      'uuid',   true,  'Parent institute UUID.'),
      F('studentId',        'uuid',   true,  'Student UUID.'),
      F('type',             'enum:CertificateType', true, 'Certificate type.'),
      F('status',           'enum:CertificateStatus', false, 'Certificate status.'),
      F('certificateNumber','string', false, 'Unique certificate number.', 64),
      F('verificationCode', 'string', false, 'Verification code.', 64),
      F('purpose',          'string', false, 'Purpose of certificate.', 500),
      F('fileObjectId',     'uuid',   false, 'Generated file UUID.'),
      F('rejectedReason',   'string', false, 'Rejection reason.', 500),
      F('payloadJson',      'json',   false, 'Certificate payload data.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('type', 'enum:CertificateType', 'Filter by type.'),
      LF('status', 'enum:CertificateStatus', 'Filter by status.'),
    ],
  },

  // ── Help & Support ───────────────────────────────────────────────
  {
    path: 'help-center-articles',
    entity: 'HelpCenterArticle',
    tag: 'Help Center Articles',
    perm: 'help-center-articles',
    searchFields: ['title', 'slug'],
    sortFields: ['createdAt', 'title', 'viewCount'],
    defaultSort: 'createdAt',
    uniqueCheck: { field: 'slug', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',  'uuid',     true,  'Parent institute UUID.'),
      F('category',     'string',   true,  'Article category.', 100),
      F('slug',         'string',   true,  'URL-friendly slug.', 200),
      F('title',        'string',   true,  'Article title.', 255),
      F('bodyMarkdown', 'string',   true,  'Markdown body content.', 50000),
      F('tags',         'string[]', false, 'Tags.'),
      F('isPublished',  'bool',     false, 'Whether published.'),
      F('authorUserId', 'uuid',     false, 'Author user UUID.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('category', 'string', 'Filter by category.'),
      LF('isPublished', 'bool', 'Filter published/unpublished.'),
    ],
  },
  {
    path: 'tickets',
    entity: 'Ticket',
    tag: 'Tickets',
    perm: 'tickets',
    searchFields: ['ticketNumber', 'subject'],
    sortFields: ['createdAt', 'ticketNumber', 'priority', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: { field: 'ticketNumber', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',      'uuid',   true,  'Parent institute UUID.'),
      F('ticketNumber',     'string', true,  'Unique ticket number.', 64),
      F('raisedByUserId',   'uuid',   true,  'User who raised the ticket.'),
      F('studentId',        'uuid',   false, 'Related student UUID.'),
      F('category',         'enum:TicketCategory', true, 'Ticket category.'),
      F('priority',         'enum:TicketPriority', false, 'Ticket priority.'),
      F('status',           'enum:TicketStatus', false, 'Ticket status.'),
      F('subject',          'string', true,  'Ticket subject.', 255),
      F('description',      'string', true,  'Ticket description.', 5000),
      F('assignedToUserId', 'uuid',   false, 'Assigned agent UUID.'),
      F('resolutionText',   'string', false, 'Resolution text.', 5000),
      F('attachmentsJson',  'json',   false, 'Attachments.'),
      F('threadJson',       'json',   false, 'Conversation thread.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('raisedByUserId', 'uuid', 'Filter by raiser.'),
      LF('assignedToUserId', 'uuid', 'Filter by assignee.'),
      LF('category', 'enum:TicketCategory', 'Filter by category.'),
      LF('priority', 'enum:TicketPriority', 'Filter by priority.'),
      LF('status', 'enum:TicketStatus', 'Filter by status.'),
    ],
  },

  // ── Library ──────────────────────────────────────────────────────
  {
    path: 'books',
    entity: 'Book',
    tag: 'Books',
    perm: 'books',
    searchFields: ['title', 'isbn'],
    sortFields: ['createdAt', 'title', 'publishYear'],
    defaultSort: 'title',
    uniqueCheck: { field: 'isbn', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',     'uuid',     true,  'Parent institute UUID.'),
      F('isbn',            'string',   false, 'ISBN.', 20),
      F('title',           'string',   true,  'Book title.', 500),
      F('subtitle',        'string',   false, 'Subtitle.', 500),
      F('authors',         'string[]', false, 'Author names.'),
      F('publisher',       'string',   false, 'Publisher.', 200),
      F('edition',         'string',   false, 'Edition.', 50),
      F('publishYear',     'int',      false, 'Publication year.', 1000),
      F('language',        'string',   false, 'Language.', 50),
      F('category',        'string',   false, 'Category.', 100),
      F('subjects',        'string[]', false, 'Subject tags.'),
      F('description',     'string',   false, 'Description.', 2000),
      F('coverUrl',        'string',   false, 'Cover image URL.', 500),
      F('totalCopies',     'int',      false, 'Total copies.', 0),
      F('availableCopies', 'int',      false, 'Available copies.', 0),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('category', 'string', 'Filter by category.'),
      LF('language', 'string', 'Filter by language.'),
    ],
  },
  {
    path: 'book-copies',
    entity: 'BookCopy',
    tag: 'Book Copies',
    perm: 'book-copies',
    searchFields: ['accessionNo'],
    sortFields: ['createdAt', 'accessionNo', 'status'],
    defaultSort: 'accessionNo',
    uniqueCheck: { field: 'accessionNo', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',   'uuid',   true,  'Parent institute UUID.'),
      F('bookId',        'uuid',   true,  'Book UUID.'),
      F('accessionNo',   'string', true,  'Unique accession number.', 64),
      F('shelfLocation', 'string', false, 'Shelf location.', 64),
      F('acquiredOn',    'date',   false, 'Date acquired.'),
      F('price',         'decimal',false, 'Purchase price.'),
      F('status',        'enum:BookStatus', false, 'Copy status.'),
      F('notes',         'string', false, 'Notes.', 500),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('bookId',      'uuid', 'Filter by book.'),
      LF('status', 'enum:BookStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'book-issues',
    entity: 'BookIssue',
    tag: 'Book Issues',
    perm: 'book-issues',
    searchFields: [],
    sortFields: ['createdAt', 'issuedAt', 'dueAt', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',    'uuid', true,  'Parent institute UUID.'),
      F('bookCopyId',     'uuid', true,  'Book copy UUID.'),
      F('studentId',      'uuid', false, 'Student UUID.'),
      F('borrowerUserId', 'uuid', true,  'Borrower user UUID.'),
      F('dueAt',          'date', true,  'Due date for return.'),
      F('status',         'enum:BookIssueStatus', false, 'Issue status.'),
      F('issuedByUserId', 'uuid', true,  'Issuing librarian UUID.'),
      F('notes',          'string', false, 'Notes.', 500),
    ],
    filters: [
      LF('instituteId',    'uuid', 'Filter by institute.'),
      LF('bookCopyId',     'uuid', 'Filter by book copy.'),
      LF('borrowerUserId', 'uuid', 'Filter by borrower.'),
      LF('studentId',      'uuid', 'Filter by student.'),
      LF('status', 'enum:BookIssueStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'book-reservations',
    entity: 'BookReservation',
    tag: 'Book Reservations',
    perm: 'book-reservations',
    searchFields: [],
    sortFields: ['createdAt', 'reservedAt', 'expiresAt', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',      'uuid', true,  'Parent institute UUID.'),
      F('bookId',           'uuid', true,  'Book UUID.'),
      F('studentId',        'uuid', false, 'Student UUID.'),
      F('reservedByUserId', 'uuid', true,  'Reserver user UUID.'),
      F('expiresAt',        'date', true,  'Reservation expiry.'),
      F('status',           'enum:ReservationStatus', false, 'Reservation status.'),
      F('queuePosition',    'int',  false, 'Queue position.', 0),
      F('notes',            'string', false, 'Notes.', 500),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('bookId',      'uuid', 'Filter by book.'),
      LF('reservedByUserId', 'uuid', 'Filter by reserver.'),
      LF('status', 'enum:ReservationStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'library-fines',
    entity: 'LibraryFine',
    tag: 'Library Fines',
    perm: 'library-fines',
    searchFields: ['reason'],
    sortFields: ['createdAt', 'amount'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId', 'uuid',    true,  'Parent institute UUID.'),
      F('bookIssueId', 'uuid',    false, 'Book issue UUID.'),
      F('studentId',   'uuid',    false, 'Student UUID.'),
      F('userId',      'uuid',    true,  'User UUID.'),
      F('amount',      'decimal', true,  'Fine amount.'),
      F('reason',      'string',  true,  'Reason for fine.', 500),
      F('paid',        'bool',    false, 'Whether fine is paid.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('userId',      'uuid', 'Filter by user.'),
      LF('paid', 'bool', 'Filter by paid status.'),
    ],
  },

  // ── Hostel ───────────────────────────────────────────────────────
  {
    path: 'hostels',
    entity: 'Hostel',
    tag: 'Hostels',
    perm: 'hostels',
    searchFields: ['code', 'name'],
    sortFields: ['createdAt', 'code', 'name'],
    defaultSort: 'code',
    uniqueCheck: { field: 'code', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',  'uuid',   true,  'Parent institute UUID.'),
      F('campusId',     'uuid',   false, 'Campus UUID.'),
      F('code',         'string', true,  'Unique hostel code.', 32),
      F('name',         'string', true,  'Hostel name.', 100),
      F('type',         'enum:HostelType', true, 'Hostel type.'),
      F('totalRooms',   'int',    false, 'Total rooms.', 0),
      F('totalBeds',    'int',    false, 'Total beds.', 0),
      F('wardenUserId', 'uuid',   false, 'Warden user UUID.'),
      F('address',      'string', false, 'Address.', 500),
      F('amenitiesJson','json',   false, 'Amenities data.'),
      F('isActive',     'bool',   false, 'Whether hostel is active.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('campusId',    'uuid', 'Filter by campus.'),
      LF('type', 'enum:HostelType', 'Filter by type.'),
      LF('isActive', 'bool', 'Filter by active status.'),
    ],
  },
  {
    path: 'hostel-rooms',
    entity: 'HostelRoom',
    tag: 'Hostel Rooms',
    perm: 'hostel-rooms',
    searchFields: ['roomNumber'],
    sortFields: ['createdAt', 'roomNumber', 'capacity'],
    defaultSort: 'roomNumber',
    uniqueCheck: { field: 'roomNumber', scope: 'hostelId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId', 'uuid',    true,  'Parent institute UUID.'),
      F('hostelId',    'uuid',    true,  'Hostel UUID.'),
      F('roomNumber',  'string',  true,  'Room number.', 32),
      F('floor',       'int',     false, 'Floor number.'),
      F('capacity',    'int',     true,  'Room capacity.', 1),
      F('occupied',    'int',     false, 'Currently occupied.', 0),
      F('roomType',    'string',  false, 'Room type.', 32),
      F('monthlyRent', 'decimal', false, 'Monthly rent.'),
      F('isActive',    'bool',    false, 'Whether room is active.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('hostelId',    'uuid', 'Filter by hostel.'),
      LF('isActive', 'bool', 'Filter by active status.'),
    ],
  },
  {
    path: 'hostel-allocations',
    entity: 'HostelAllocation',
    tag: 'Hostel Allocations',
    perm: 'hostel-allocations',
    searchFields: [],
    sortFields: ['createdAt', 'allocatedAt', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',       'uuid', true,  'Parent institute UUID.'),
      F('hostelId',          'uuid', true,  'Hostel UUID.'),
      F('hostelRoomId',      'uuid', true,  'Hostel room UUID.'),
      F('studentId',         'uuid', true,  'Student UUID.'),
      F('academicYearId',    'uuid', true,  'Academic year UUID.'),
      F('bedNumber',         'string', false, 'Bed number.', 16),
      F('status',            'enum:HostelAllocationStatus', false, 'Allocation status.'),
      F('allocatedByUserId', 'uuid', false, 'Allocating user UUID.'),
      F('notes',             'string', false, 'Notes.', 500),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('hostelId',    'uuid', 'Filter by hostel.'),
      LF('hostelRoomId','uuid', 'Filter by room.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('academicYearId', 'uuid', 'Filter by academic year.'),
      LF('status', 'enum:HostelAllocationStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'hostel-leave-requests',
    entity: 'HostelLeaveRequest',
    tag: 'Hostel Leave Requests',
    perm: 'hostel-leave-requests',
    searchFields: ['reason'],
    sortFields: ['createdAt', 'fromDate', 'toDate', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',      'uuid',   true,  'Parent institute UUID.'),
      F('hostelId',         'uuid',   true,  'Hostel UUID.'),
      F('studentId',        'uuid',   true,  'Student UUID.'),
      F('fromDate',         'date',   true,  'Leave start date.'),
      F('toDate',           'date',   true,  'Leave end date.'),
      F('reason',           'string', true,  'Reason for leave.', 1000),
      F('destination',      'string', false, 'Destination.', 255),
      F('emergencyContact', 'string', false, 'Emergency contact.', 20),
      F('status',           'enum:LeaveRequestStatus', false, 'Request status.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('hostelId',    'uuid', 'Filter by hostel.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('status', 'enum:LeaveRequestStatus', 'Filter by status.'),
    ],
  },

  // ── Transport ────────────────────────────────────────────────────
  {
    path: 'transport-routes',
    entity: 'TransportRoute',
    tag: 'Transport Routes',
    perm: 'transport-routes',
    searchFields: ['code', 'name'],
    sortFields: ['createdAt', 'code', 'name'],
    defaultSort: 'code',
    uniqueCheck: { field: 'code', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId', 'uuid',    true,  'Parent institute UUID.'),
      F('code',        'string',  true,  'Unique route code.', 32),
      F('name',        'string',  true,  'Route name.', 100),
      F('origin',      'string',  true,  'Origin.', 200),
      F('destination', 'string',  true,  'Destination.', 200),
      F('distanceKm',  'decimal', false, 'Distance in km.'),
      F('feePerTerm',  'decimal', false, 'Fee per term.'),
      F('isActive',    'bool',    false, 'Whether route is active.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('isActive', 'bool', 'Filter by active status.'),
    ],
  },
  {
    path: 'transport-vehicles',
    entity: 'TransportVehicle',
    tag: 'Transport Vehicles',
    perm: 'transport-vehicles',
    searchFields: ['registrationNo'],
    sortFields: ['createdAt', 'registrationNo', 'capacity'],
    defaultSort: 'registrationNo',
    uniqueCheck: { field: 'registrationNo', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',        'uuid',   true,  'Parent institute UUID.'),
      F('routeId',            'uuid',   false, 'Route UUID.'),
      F('registrationNo',     'string', true,  'Vehicle registration number.', 32),
      F('model',              'string', false, 'Vehicle model.', 100),
      F('capacity',           'int',    true,  'Seating capacity.', 1),
      F('driverName',         'string', false, 'Driver name.', 100),
      F('driverPhone',        'string', false, 'Driver phone.', 20),
      F('driverLicense',      'string', false, 'Driver license number.', 32),
      F('insuranceExpiresOn', 'date',   false, 'Insurance expiry date.'),
      F('pollutionExpiresOn', 'date',   false, 'Pollution cert expiry.'),
      F('isActive',           'bool',   false, 'Whether vehicle is active.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('routeId',     'uuid', 'Filter by route.'),
      LF('isActive', 'bool', 'Filter by active status.'),
    ],
  },
  {
    path: 'transport-stops',
    entity: 'TransportStop',
    tag: 'Transport Stops',
    perm: 'transport-stops',
    searchFields: ['name'],
    sortFields: ['createdAt', 'name', 'sequence'],
    defaultSort: 'sequence',
    uniqueCheck: { field: 'sequence', scope: 'routeId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId', 'uuid',    true,  'Parent institute UUID.'),
      F('routeId',     'uuid',    true,  'Route UUID.'),
      F('name',        'string',  true,  'Stop name.', 200),
      F('sequence',    'int',     true,  'Stop sequence order.', 0),
      F('pickupTime',  'string',  false, 'Pickup time (HH:mm).', 10),
      F('dropTime',    'string',  false, 'Drop time (HH:mm).', 10),
      F('geoLat',      'decimal', false, 'Latitude.'),
      F('geoLng',      'decimal', false, 'Longitude.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('routeId',     'uuid', 'Filter by route.'),
    ],
  },
  {
    path: 'transport-passes',
    entity: 'TransportPass',
    tag: 'Transport Passes',
    perm: 'transport-passes',
    searchFields: ['passNumber'],
    sortFields: ['createdAt', 'passNumber', 'validFrom'],
    defaultSort: 'createdAt',
    uniqueCheck: { field: 'passNumber', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',    'uuid',   true,  'Parent institute UUID.'),
      F('studentId',      'uuid',   true,  'Student UUID.'),
      F('routeId',        'uuid',   true,  'Route UUID.'),
      F('stopId',         'uuid',   false, 'Stop UUID.'),
      F('academicYearId', 'uuid',   true,  'Academic year UUID.'),
      F('passNumber',     'string', true,  'Unique pass number.', 64),
      F('validFrom',      'date',   true,  'Valid from date.'),
      F('validTo',        'date',   true,  'Valid to date.'),
      F('status',         'enum:TransportPassStatus', false, 'Pass status.'),
      F('feePaid',        'bool',   false, 'Whether fee is paid.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('routeId',     'uuid', 'Filter by route.'),
      LF('academicYearId', 'uuid', 'Filter by academic year.'),
      LF('status', 'enum:TransportPassStatus', 'Filter by status.'),
    ],
  },

  // ── Clubs & Events ───────────────────────────────────────────────
  {
    path: 'clubs',
    entity: 'Club',
    tag: 'Clubs',
    perm: 'clubs',
    searchFields: ['code', 'name'],
    sortFields: ['createdAt', 'code', 'name'],
    defaultSort: 'name',
    uniqueCheck: { field: 'code', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',             'uuid',   true,  'Parent institute UUID.'),
      F('code',                    'string', true,  'Unique club code.', 32),
      F('name',                    'string', true,  'Club name.', 200),
      F('category',                'string', false, 'Club category.', 100),
      F('description',             'string', false, 'Description.', 2000),
      F('facultyAdvisorFacultyId', 'uuid',   false, 'Faculty advisor UUID.'),
      F('presidentUserId',         'uuid',   false, 'President user UUID.'),
      F('foundedOn',               'date',   false, 'Founded date.'),
      F('logoUrl',                 'string', false, 'Logo URL.', 500),
      F('isActive',                'bool',   false, 'Whether club is active.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('category', 'string', 'Filter by category.'),
      LF('isActive', 'bool', 'Filter by active status.'),
    ],
  },
  {
    path: 'club-memberships',
    entity: 'ClubMembership',
    tag: 'Club Memberships',
    perm: 'club-memberships',
    searchFields: [],
    sortFields: ['createdAt', 'joinedAt', 'role'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId', 'uuid',   true,  'Parent institute UUID.'),
      F('clubId',      'uuid',   true,  'Club UUID.'),
      F('studentId',   'uuid',   true,  'Student UUID.'),
      F('role',        'string', false, 'Membership role.', 32),
      F('isActive',    'bool',   false, 'Whether membership is active.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('clubId',      'uuid', 'Filter by club.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('isActive', 'bool', 'Filter by active status.'),
    ],
  },
  {
    path: 'events',
    entity: 'Event',
    tag: 'Events',
    perm: 'events',
    searchFields: ['title'],
    sortFields: ['createdAt', 'title', 'startAt', 'status'],
    defaultSort: 'startAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',          'uuid',    true,  'Parent institute UUID.'),
      F('clubId',               'uuid',    false, 'Club UUID.'),
      F('organizerUserId',      'uuid',    true,  'Organizer user UUID.'),
      F('title',                'string',  true,  'Event title.', 255),
      F('description',          'string',  false, 'Description.', 5000),
      F('category',             'string',  false, 'Event category.', 100),
      F('startAt',              'date',    true,  'Event start datetime.'),
      F('endAt',                'date',    true,  'Event end datetime.'),
      F('venue',                'string',  false, 'Venue.', 255),
      F('status',               'enum:EventStatus', false, 'Event status.'),
      F('registrationOpensAt',  'date',    false, 'Registration opens.'),
      F('registrationClosesAt', 'date',    false, 'Registration closes.'),
      F('capacity',             'int',     false, 'Max capacity.', 1),
      F('feeAmount',            'decimal', false, 'Registration fee.'),
      F('bannerUrl',            'string',  false, 'Banner image URL.', 500),
      F('metadata',             'json',    false, 'Additional metadata.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('clubId',      'uuid', 'Filter by club.'),
      LF('status', 'enum:EventStatus', 'Filter by status.'),
      LF('category', 'string', 'Filter by category.'),
    ],
  },
  {
    path: 'event-registrations',
    entity: 'EventRegistration',
    tag: 'Event Registrations',
    perm: 'event-registrations',
    searchFields: [],
    sortFields: ['createdAt', 'registeredAt'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId', 'uuid', true,  'Parent institute UUID.'),
      F('eventId',     'uuid', true,  'Event UUID.'),
      F('studentId',   'uuid', false, 'Student UUID.'),
      F('userId',      'uuid', true,  'User UUID.'),
      F('feePaid',     'bool', false, 'Whether fee is paid.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('eventId',     'uuid', 'Filter by event.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('userId',      'uuid', 'Filter by user.'),
    ],
  },

  // ── Feedback ─────────────────────────────────────────────────────
  {
    path: 'feedback',
    entity: 'Feedback',
    tag: 'Feedback',
    perm: 'feedback',
    searchFields: ['title'],
    sortFields: ['createdAt', 'rating', 'targetType'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',       'uuid',   true,  'Parent institute UUID.'),
      F('submittedByUserId', 'uuid',   true,  'Submitter user UUID.'),
      F('studentId',         'uuid',   false, 'Student UUID.'),
      F('targetType',        'enum:FeedbackTargetType', true, 'Target type.'),
      F('targetId',          'string', true,  'Target entity UUID.', 64),
      F('rating',            'int',    true,  'Rating (1-5).', 1),
      F('title',             'string', false, 'Feedback title.', 255),
      F('comments',          'string', false, 'Comments.', 5000),
      F('isAnonymous',       'bool',   false, 'Whether feedback is anonymous.'),
      F('responsesJson',     'json',   false, 'Structured responses.'),
      F('termId',            'uuid',   false, 'Term UUID.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('submittedByUserId', 'uuid', 'Filter by submitter.'),
      LF('targetType', 'enum:FeedbackTargetType', 'Filter by target type.'),
      LF('targetId', 'string', 'Filter by target ID.'),
      LF('rating', 'int', 'Filter by rating.'),
    ],
  },

  // ── Placements ───────────────────────────────────────────────────
  {
    path: 'companies',
    entity: 'Company',
    tag: 'Companies',
    perm: 'companies',
    searchFields: ['name'],
    sortFields: ['createdAt', 'name', 'status'],
    defaultSort: 'name',
    uniqueCheck: { field: 'name', scope: 'instituteId' },
    parentChecks: ['institute'],
    fields: [
      F('instituteId',         'uuid',   true,  'Parent institute UUID.'),
      F('name',                'string', true,  'Company name.', 255),
      F('legalName',           'string', false, 'Legal name.', 255),
      F('website',             'string', false, 'Website URL.', 500),
      F('industry',            'string', false, 'Industry.', 100),
      F('size',                'enum:CompanySize', false, 'Company size.'),
      F('hqLocation',          'string', false, 'HQ location.', 255),
      F('description',         'string', false, 'Description.', 2000),
      F('logoUrl',             'string', false, 'Logo URL.', 500),
      F('status',              'enum:CompanyStatus', false, 'Company status.'),
      F('primaryContactName',  'string', false, 'Primary contact name.', 100),
      F('primaryContactEmail', 'string', false, 'Primary contact email.', 255),
      F('primaryContactPhone', 'string', false, 'Primary contact phone.', 20),
      F('mouSignedAt',         'date',   false, 'MOU signing date.'),
      F('blacklistReason',     'string', false, 'Blacklist reason.', 500),
      F('metadata',            'json',   false, 'Additional metadata.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('status', 'enum:CompanyStatus', 'Filter by status.'),
      LF('industry', 'string', 'Filter by industry.'),
      LF('size', 'enum:CompanySize', 'Filter by size.'),
    ],
  },
  {
    path: 'placement-drives',
    entity: 'PlacementDrive',
    tag: 'Placement Drives',
    perm: 'placement-drives',
    searchFields: ['title', 'jobRole'],
    sortFields: ['createdAt', 'title', 'driveDate', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',          'uuid',     true,  'Parent institute UUID.'),
      F('companyId',            'uuid',     true,  'Company UUID.'),
      F('academicYearId',       'uuid',     true,  'Academic year UUID.'),
      F('title',                'string',   true,  'Drive title.', 255),
      F('description',          'string',   false, 'Description.', 5000),
      F('type',                 'enum:DriveType', true, 'Drive type.'),
      F('status',               'enum:DriveStatus', false, 'Drive status.'),
      F('jobRole',              'string',   true,  'Job role.', 200),
      F('jobDescription',       'string',   false, 'Job description.', 5000),
      F('ctcMin',               'decimal',  false, 'Minimum CTC.'),
      F('ctcMax',               'decimal',  false, 'Maximum CTC.'),
      F('stipend',              'decimal',  false, 'Stipend.'),
      F('currency',             'string',   false, 'Currency code.', 10),
      F('locations',            'string[]', false, 'Job locations.'),
      F('bondYears',            'int',      false, 'Bond years.', 0),
      F('eligibilityJson',      'json',     false, 'Eligibility criteria.'),
      F('minCgpa',              'decimal',  false, 'Minimum CGPA.'),
      F('maxBacklogs',          'int',      false, 'Max allowed backlogs.', 0),
      F('eligibleProgramsJson', 'json',     false, 'Eligible programs.'),
      F('registrationOpensAt',  'date',     false, 'Registration opens.'),
      F('registrationClosesAt', 'date',     false, 'Registration closes.'),
      F('driveDate',            'date',     false, 'Drive date.'),
      F('totalSeats',           'int',      false, 'Total seats.', 0),
      F('coordinatorUserId',    'uuid',     false, 'Coordinator user UUID.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('companyId',   'uuid', 'Filter by company.'),
      LF('academicYearId', 'uuid', 'Filter by academic year.'),
      LF('type', 'enum:DriveType', 'Filter by type.'),
      LF('status', 'enum:DriveStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'placement-applications',
    entity: 'PlacementApplication',
    tag: 'Placement Applications',
    perm: 'placement-applications',
    searchFields: [],
    sortFields: ['createdAt', 'appliedAt', 'stage'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',        'uuid',   true,  'Parent institute UUID.'),
      F('driveId',            'uuid',   true,  'Placement drive UUID.'),
      F('studentId',          'uuid',   true,  'Student UUID.'),
      F('stage',              'enum:ApplicationStage', false, 'Application stage.'),
      F('resumeFileObjectId', 'uuid',   false, 'Resume file UUID.'),
      F('coverLetter',        'string', false, 'Cover letter.', 5000),
      F('testScoresJson',     'json',   false, 'Test scores.'),
      F('notes',              'string', false, 'Notes.', 1000),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('driveId',     'uuid', 'Filter by drive.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('stage', 'enum:ApplicationStage', 'Filter by stage.'),
    ],
  },
  {
    path: 'placement-offers',
    entity: 'PlacementOffer',
    tag: 'Placement Offers',
    perm: 'placement-offers',
    searchFields: ['jobRole'],
    sortFields: ['createdAt', 'jobRole', 'ctc', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',             'uuid',    true,  'Parent institute UUID.'),
      F('driveId',                 'uuid',    true,  'Drive UUID.'),
      F('applicationId',           'uuid',    true,  'Application UUID.'),
      F('companyId',               'uuid',    true,  'Company UUID.'),
      F('studentId',               'uuid',    true,  'Student UUID.'),
      F('type',                    'enum:OfferType', true, 'Offer type.'),
      F('status',                  'enum:OfferStatus', false, 'Offer status.'),
      F('jobRole',                 'string',  true,  'Job role.', 200),
      F('ctc',                     'decimal', true,  'Cost to company.'),
      F('baseSalary',              'decimal', false, 'Base salary.'),
      F('stipend',                 'decimal', false, 'Stipend amount.'),
      F('currency',                'string',  false, 'Currency code.', 10),
      F('location',                'string',  false, 'Job location.', 255),
      F('joiningDate',             'date',    false, 'Joining date.'),
      F('offerLetterFileObjectId', 'uuid',    false, 'Offer letter file UUID.'),
      F('responseDeadline',        'date',    false, 'Response deadline.'),
      F('isPrimaryOffer',          'bool',    false, 'Whether primary offer.'),
      F('metadata',                'json',    false, 'Additional metadata.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('driveId',     'uuid', 'Filter by drive.'),
      LF('companyId',   'uuid', 'Filter by company.'),
      LF('studentId',   'uuid', 'Filter by student.'),
      LF('type', 'enum:OfferType', 'Filter by type.'),
      LF('status', 'enum:OfferStatus', 'Filter by status.'),
    ],
  },

  // ── Research ─────────────────────────────────────────────────────
  {
    path: 'research-projects',
    entity: 'ResearchProject',
    tag: 'Research Projects',
    perm: 'research-projects',
    searchFields: ['title'],
    sortFields: ['createdAt', 'title', 'status', 'startDate'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',                    'uuid',     true,  'Parent institute UUID.'),
      F('departmentId',                   'uuid',     false, 'Department UUID.'),
      F('principalInvestigatorFacultyId', 'uuid',     true,  'PI faculty UUID.'),
      F('title',                          'string',   true,  'Project title.', 500),
      F('abstract',                       'string',   false, 'Abstract.', 5000),
      F('domain',                         'string',   false, 'Research domain.', 200),
      F('keywords',                       'string[]', false, 'Keywords.'),
      F('status',                         'enum:ResearchProjectStatus', false, 'Project status.'),
      F('startDate',                      'date',     false, 'Start date.'),
      F('endDate',                        'date',     false, 'End date.'),
      F('budgetAmount',                   'decimal',  false, 'Budget amount.'),
      F('currency',                       'string',   false, 'Currency code.', 10),
      F('fundingSource',                  'string',   false, 'Funding source.', 255),
      F('collaboratorsJson',              'json',     false, 'Collaborators data.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('departmentId', 'uuid', 'Filter by department.'),
      LF('principalInvestigatorFacultyId', 'uuid', 'Filter by PI.'),
      LF('status', 'enum:ResearchProjectStatus', 'Filter by status.'),
      LF('domain', 'string', 'Filter by domain.'),
    ],
  },
  {
    path: 'publications',
    entity: 'Publication',
    tag: 'Publications',
    perm: 'publications',
    searchFields: ['title'],
    sortFields: ['createdAt', 'title', 'publishedOn', 'citationCount'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',            'uuid',     true,  'Parent institute UUID.'),
      F('projectId',              'uuid',     false, 'Research project UUID.'),
      F('type',                   'enum:PublicationType', true, 'Publication type.'),
      F('title',                  'string',   true,  'Publication title.', 500),
      F('abstract',               'string',   false, 'Abstract.', 5000),
      F('authors',                'string[]', true,  'Author names.'),
      F('primaryAuthorFacultyId', 'uuid',     false, 'Primary author faculty UUID.'),
      F('venue',                  'string',   false, 'Publication venue.', 500),
      F('publisher',              'string',   false, 'Publisher.', 200),
      F('doi',                    'string',   false, 'DOI.', 255),
      F('isbn',                   'string',   false, 'ISBN.', 20),
      F('issn',                   'string',   false, 'ISSN.', 20),
      F('volume',                 'string',   false, 'Volume.', 20),
      F('issue',                  'string',   false, 'Issue.', 20),
      F('pageStart',              'string',   false, 'Start page.', 10),
      F('pageEnd',                'string',   false, 'End page.', 10),
      F('publishedOn',            'date',     false, 'Publication date.'),
      F('indexingJson',           'json',     false, 'Indexing details.'),
      F('impactFactor',           'decimal',  false, 'Impact factor.'),
      F('citationCount',          'int',      false, 'Citation count.', 0),
      F('url',                    'string',   false, 'URL.', 500),
      F('fileObjectId',           'uuid',     false, 'File object UUID.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('projectId',   'uuid', 'Filter by project.'),
      LF('type', 'enum:PublicationType', 'Filter by type.'),
      LF('primaryAuthorFacultyId', 'uuid', 'Filter by primary author.'),
    ],
  },
  {
    path: 'grants',
    entity: 'Grant',
    tag: 'Grants',
    perm: 'grants',
    searchFields: ['title', 'fundingAgency'],
    sortFields: ['createdAt', 'title', 'amountSanctioned', 'status'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',      'uuid',     true,  'Parent institute UUID.'),
      F('projectId',        'uuid',     false, 'Research project UUID.'),
      F('title',            'string',   true,  'Grant title.', 500),
      F('fundingAgency',    'string',   true,  'Funding agency.', 255),
      F('schemeName',       'string',   false, 'Scheme name.', 255),
      F('amountSanctioned', 'decimal',  false, 'Amount sanctioned.'),
      F('amountReleased',   'decimal',  false, 'Amount released.'),
      F('currency',         'string',   false, 'Currency code.', 10),
      F('status',           'enum:GrantStatus', false, 'Grant status.'),
      F('appliedOn',        'date',     false, 'Application date.'),
      F('sanctionedOn',     'date',     false, 'Sanction date.'),
      F('startDate',        'date',     false, 'Start date.'),
      F('endDate',          'date',     false, 'End date.'),
      F('pifacultyId',      'uuid',     true,  'PI faculty UUID.'),
      F('coPis',            'string[]', false, 'Co-PI UUIDs.'),
      F('referenceNumber',  'string',   false, 'Reference number.', 64),
      F('documentsJson',    'json',     false, 'Documents data.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('projectId',   'uuid', 'Filter by project.'),
      LF('pifacultyId', 'uuid', 'Filter by PI.'),
      LF('status', 'enum:GrantStatus', 'Filter by status.'),
    ],
  },
  {
    path: 'patents',
    entity: 'Patent',
    tag: 'Patents',
    perm: 'patents',
    searchFields: ['title', 'applicationNumber', 'patentNumber'],
    sortFields: ['createdAt', 'title', 'status', 'filedOn'],
    defaultSort: 'createdAt',
    uniqueCheck: null,
    parentChecks: ['institute'],
    fields: [
      F('instituteId',              'uuid',     true,  'Parent institute UUID.'),
      F('projectId',                'uuid',     false, 'Research project UUID.'),
      F('title',                    'string',   true,  'Patent title.', 500),
      F('abstract',                 'string',   false, 'Abstract.', 5000),
      F('inventors',                'string[]', false, 'Inventor names.'),
      F('primaryInventorFacultyId', 'uuid',     false, 'Primary inventor faculty UUID.'),
      F('applicationNumber',        'string',   false, 'Application number.', 64),
      F('patentNumber',             'string',   false, 'Patent number.', 64),
      F('status',                   'enum:PatentStatus', false, 'Patent status.'),
      F('jurisdiction',             'string',   false, 'Jurisdiction.', 100),
      F('filedOn',                  'date',     false, 'Filing date.'),
      F('publishedOn',              'date',     false, 'Publication date.'),
      F('grantedOn',                'date',     false, 'Grant date.'),
      F('expiresOn',                'date',     false, 'Expiry date.'),
      F('classification',           'string',   false, 'Classification.', 100),
      F('url',                      'string',   false, 'URL.', 500),
      F('fileObjectId',             'uuid',     false, 'File object UUID.'),
    ],
    filters: [
      LF('instituteId', 'uuid', 'Filter by institute.'),
      LF('projectId',   'uuid', 'Filter by project.'),
      LF('primaryInventorFacultyId', 'uuid', 'Filter by primary inventor.'),
      LF('status', 'enum:PatentStatus', 'Filter by status.'),
    ],
  },
];

// ─── Template: Collect all unique enum names used ──────────────────
function collectEnums(mod) {
  const enums = new Set();
  for (const f of mod.fields) {
    if (f.type.startsWith('enum:')) enums.add(f.type.split(':')[1]);
  }
  for (const f of mod.filters || []) {
    if (f.type.startsWith('enum:')) enums.add(f.type.split(':')[1]);
  }
  return [...enums];
}

// ─── TS type from field type ───────────────────────────────────────
function tsType(f) {
  switch(f.type) {
    case 'uuid': case 'string': case 'date': return 'string';
    case 'int': case 'decimal': return 'number';
    case 'bool': return 'boolean';
    case 'json': return 'Record<string, unknown>';
    case 'string[]': return 'string[]';
    default: if (f.type.startsWith('enum:')) return f.type.split(':')[1]; return 'any';
  }
}

// ─── TS type for filter ────────────────────────────────────────────
function tsTypeFilter(f) {
  switch(f.type) {
    case 'uuid': case 'string': return 'string';
    case 'int': return 'number';
    case 'bool': return 'boolean';
    default: if (f.type.startsWith('enum:')) return f.type.split(':')[1]; return 'string';
  }
}

// ─── Generate Create DTO ───────────────────────────────────────────
function genCreateDto(mod) {
  const pascal = mod.entity;
  const enums = collectEnums(mod);
  
  // Collect validator imports
  const validatorImports = new Set();
  for (const f of mod.fields) {
    if (!f.required) validatorImports.add('IsOptional');
    switch(f.type) {
      case 'uuid': validatorImports.add('IsUUID'); break;
      case 'string': validatorImports.add('IsString'); validatorImports.add('MaxLength'); break;
      case 'int': validatorImports.add('IsInt'); if (f.extra[0] !== undefined) validatorImports.add('Min'); break;
      case 'decimal': validatorImports.add('IsNumber'); break;
      case 'bool': validatorImports.add('IsBoolean'); break;
      case 'date': validatorImports.add('IsDateString'); break;
      case 'json': validatorImports.add('IsObject'); break;
      case 'string[]': validatorImports.add('IsArray'); validatorImports.add('IsString'); break;
      default: if (f.type.startsWith('enum:')) validatorImports.add('IsEnum');
    }
  }

  let code = `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n`;
  if (enums.length) {
    code += `import { ${enums.join(', ')} } from '@prisma/client';\n`;
  }
  code += `import {\n  ${[...validatorImports].sort().join(',\n  ')},\n} from 'class-validator';\n\n`;
  code += `export class Create${pascal}Dto {\n`;

  for (const f of mod.fields) {
    const swaggerDec = f.required ? 'ApiProperty' : 'ApiPropertyOptional';
    let swaggerOpts = `description: '${f.desc}'`;
    if (f.type === 'uuid') swaggerOpts += `, format: 'uuid'`;
    if (f.type.startsWith('enum:')) swaggerOpts += `, enum: ${f.type.split(':')[1]}`;
    
    code += `  @${swaggerDec}({ ${swaggerOpts} })\n`;
    if (!f.required) code += `  @IsOptional()\n`;
    
    switch(f.type) {
      case 'uuid': code += `  @IsUUID()\n`; break;
      case 'string': 
        code += `  @IsString()\n`;
        code += `  @MaxLength(${f.extra[0] || 255})\n`;
        break;
      case 'int':
        code += `  @IsInt()\n`;
        if (f.extra[0] !== undefined) code += `  @Min(${f.extra[0]})\n`;
        break;
      case 'decimal': code += `  @IsNumber()\n`; break;
      case 'bool': code += `  @IsBoolean()\n`; break;
      case 'date': code += `  @IsDateString()\n`; break;
      case 'json': code += `  @IsObject()\n`; break;
      case 'string[]': code += `  @IsArray()\n  @IsString({ each: true })\n`; break;
      default:
        if (f.type.startsWith('enum:')) code += `  @IsEnum(${f.type.split(':')[1]})\n`;
    }
    
    const mark = f.required ? '!' : '?';
    code += `  ${f.name}${mark}: ${tsType(f)};\n\n`;
  }

  code += `}\n`;
  return code;
}

// ─── Generate Update DTO ───────────────────────────────────────────
function genUpdateDto(mod) {
  const pascal = mod.entity;
  const kebab = mod.path;
  const singular = kebab.endsWith('ies') ? kebab.slice(0,-3) + 'y' : 
                   kebab.endsWith('ses') ? kebab.slice(0,-2) :
                   kebab.endsWith('s') ? kebab.slice(0,-1) : kebab;
  return `import { OmitType, PartialType } from '@nestjs/swagger';
import { Create${pascal}Dto } from './create-${singular}.dto';

export class Update${pascal}Dto extends PartialType(
  OmitType(Create${pascal}Dto, ['instituteId'] as const),
) {}
`;
}

// ─── Generate List Query DTO ───────────────────────────────────────
function genListQuery(mod) {
  const pascal = mod.entity;
  const enums = [];
  for (const f of mod.filters || []) {
    if (f.type.startsWith('enum:')) {
      const e = f.type.split(':')[1];
      if (!enums.includes(e)) enums.push(e);
    }
  }

  const validatorImports = new Set(['IsOptional', 'IsInt', 'IsIn', 'IsString', 'IsBoolean', 'Min', 'Max', 'MaxLength']);
  for (const f of mod.filters || []) {
    switch(f.type) {
      case 'uuid': validatorImports.add('IsUUID'); break;
      case 'bool': validatorImports.add('IsBoolean'); break;
      case 'int': break;
      default: if (f.type.startsWith('enum:')) validatorImports.add('IsEnum');
    }
  }

  const sortFields = mod.sortFields || ['createdAt'];
  const defaultSort = mod.defaultSort || 'createdAt';

  let code = `import { ApiPropertyOptional } from '@nestjs/swagger';\n`;
  const prismaImports = ['Prisma'];
  if (enums.length) prismaImports.push(...enums);
  code += `import { ${prismaImports.join(', ')} } from '@prisma/client';\n`;
  code += `import { Transform, Type } from 'class-transformer';\n`;
  code += `import {\n  ${[...validatorImports].sort().join(',\n  ')},\n} from 'class-validator';\n\n`;

  code += `const SORTABLE_FIELDS = [${sortFields.map(s => `'${s}'`).join(', ')}] as const;\n`;
  const pascalPlural = toPascal(mod.path);
  code += `export type ${pascalPlural}SortField = (typeof SORTABLE_FIELDS)[number];\n\n`;
  code += `export class List${pascalPlural}QueryDto {\n`;

  // Filters
  for (const f of mod.filters || []) {
    if (f.type === 'uuid') {
      code += `  @ApiPropertyOptional({ description: '${f.desc}', format: 'uuid' })\n`;
      code += `  @IsOptional()\n  @IsUUID()\n`;
      code += `  ${f.name}?: string;\n\n`;
    } else if (f.type === 'string') {
      code += `  @ApiPropertyOptional({ description: '${f.desc}' })\n`;
      code += `  @IsOptional()\n  @IsString()\n  @MaxLength(120)\n`;
      code += `  ${f.name}?: string;\n\n`;
    } else if (f.type === 'int') {
      code += `  @ApiPropertyOptional({ description: '${f.desc}' })\n`;
      code += `  @IsOptional()\n  @Type(() => Number)\n  @IsInt()\n`;
      code += `  ${f.name}?: number;\n\n`;
    } else if (f.type === 'bool') {
      code += `  @ApiPropertyOptional({ description: '${f.desc}' })\n`;
      code += `  @IsOptional()\n`;
      code += `  @Transform(({ value }) =>\n    value === true || value === 'true'\n      ? true\n      : value === false || value === 'false'\n        ? false\n        : value,\n  )\n`;
      code += `  @IsBoolean()\n`;
      code += `  ${f.name}?: boolean;\n\n`;
    } else if (f.type.startsWith('enum:')) {
      const enumName = f.type.split(':')[1];
      code += `  @ApiPropertyOptional({ description: '${f.desc}', enum: ${enumName} })\n`;
      code += `  @IsOptional()\n  @IsEnum(${enumName})\n`;
      code += `  ${f.name}?: ${enumName};\n\n`;
    }
  }

  // Search
  if (mod.searchFields && mod.searchFields.length) {
    code += `  @ApiPropertyOptional({ description: 'Case-insensitive search.' })\n`;
    code += `  @IsOptional()\n  @IsString()\n  @MaxLength(120)\n`;
    code += `  search?: string;\n\n`;
  }

  // includeDeleted
  code += `  @ApiPropertyOptional({ description: 'Include soft-deleted records.', default: false })\n`;
  code += `  @IsOptional()\n`;
  code += `  @Transform(({ value }) =>\n    value === true || value === 'true'\n      ? true\n      : value === false || value === 'false'\n        ? false\n        : value,\n  )\n`;
  code += `  @IsBoolean()\n`;
  code += `  includeDeleted?: boolean;\n\n`;

  // Pagination
  code += `  @ApiPropertyOptional({ minimum: 1, default: 1 })\n`;
  code += `  @IsOptional()\n  @Type(() => Number)\n  @IsInt()\n  @Min(1)\n`;
  code += `  page?: number = 1;\n\n`;

  code += `  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })\n`;
  code += `  @IsOptional()\n  @Type(() => Number)\n  @IsInt()\n  @Min(1)\n  @Max(100)\n`;
  code += `  pageSize?: number = 20;\n\n`;

  // Sort
  code += `  @ApiPropertyOptional({ enum: SORTABLE_FIELDS, default: '${defaultSort}' })\n`;
  code += `  @IsOptional()\n  @IsIn(SORTABLE_FIELDS as unknown as string[])\n`;
  code += `  sortBy?: ${pascalPlural}SortField = '${defaultSort}';\n\n`;

  code += `  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })\n`;
  code += `  @IsOptional()\n  @IsIn(['asc', 'desc'])\n`;
  code += `  sortOrder?: Prisma.SortOrder = 'asc';\n`;

  code += `}\n`;
  return code;
}

// ─── Generate Module ───────────────────────────────────────────────
function genModule(mod) {
  const pascal = mod.entity;
  const kebab = mod.path;
  const pascalPlural = toPascal(kebab);
  return `import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ${pascalPlural}Controller } from './${kebab}.controller';
import { ${pascalPlural}Service } from './${kebab}.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [${pascalPlural}Controller],
  providers: [${pascalPlural}Service],
  exports: [${pascalPlural}Service],
})
export class ${pascalPlural}Module {}
`;
}

// ─── Generate Controller ───────────────────────────────────────────
function genController(mod) {
  const pascal = mod.entity;
  const kebab = mod.path;
  const pascalPlural = toPascal(kebab);
  const singular = kebab.endsWith('ies') ? kebab.slice(0,-3) + 'y' : 
                   kebab.endsWith('ses') ? kebab.slice(0,-2) :
                   kebab.endsWith('s') ? kebab.slice(0,-1) : kebab;
  const camelPlural = toCamel(kebab);
  const entityLower = pascal[0].toLowerCase() + pascal.slice(1);
  const tag = mod.tag;
  const perm = mod.perm;

  return `import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Create${pascal}Dto } from './dto/create-${singular}.dto';
import { List${pascalPlural}QueryDto } from './dto/list-${kebab}.query';
import { Update${pascal}Dto } from './dto/update-${singular}.dto';
import { ${pascalPlural}Service } from './${kebab}.service';

@ApiTags('${tag}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: '${kebab}', version: '1' })
export class ${pascalPlural}Controller {
  constructor(private readonly ${camelPlural}: ${pascalPlural}Service) {}

  @Get()
  @RequirePermissions('${perm}.read')
  @ApiOperation({ summary: 'List ${tag.toLowerCase()} (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of ${tag.toLowerCase()}.' })
  list(@Query() query: List${pascalPlural}QueryDto) {
    return this.${camelPlural}.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('${perm}.read')
  @ApiOperation({ summary: 'Get a single ${entityLower} by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.${camelPlural}.findOne(id);
  }

  @Post()
  @RequirePermissions('${perm}.create')
  @ApiOperation({ summary: 'Create a new ${entityLower}.' })
  create(@Body() dto: Create${pascal}Dto) {
    return this.${camelPlural}.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('${perm}.update')
  @ApiOperation({ summary: 'Update a ${entityLower} (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: Update${pascal}Dto,
  ) {
    return this.${camelPlural}.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('${perm}.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a ${entityLower}.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.${camelPlural}.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('${perm}.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted ${entityLower}.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.${camelPlural}.restore(id);
  }
}
`;
}

// ─── Generate Service ──────────────────────────────────────────────
function genService(mod) {
  const pascal = mod.entity;
  const kebab = mod.path;
  const pascalPlural = toPascal(kebab);
  const camel = toCamel(kebab.endsWith('ies') ? kebab.slice(0,-3) + 'y' : 
                         kebab.endsWith('ses') ? kebab.slice(0,-2) :
                         kebab.endsWith('s') ? kebab.slice(0,-1) : kebab);
  const singular = kebab.endsWith('ies') ? kebab.slice(0,-3) + 'y' : 
                   kebab.endsWith('ses') ? kebab.slice(0,-2) :
                   kebab.endsWith('s') ? kebab.slice(0,-1) : kebab;
  // Prisma model name is the camelCase of the entity
  const prismaModel = pascal[0].toLowerCase() + pascal.slice(1);
  const PrismaModel = pascal;
  
  const enums = collectEnums(mod);

  // Build create data mapping
  const createDataLines = [];
  const updateDataLines = [];
  const decimalFields = [];
  const jsonFields = [];
  const stringArrayFields = [];
  
  for (const f of mod.fields) {
    const n = f.name;
    if (f.type === 'decimal') {
      decimalFields.push(n);
      if (f.required) {
        createDataLines.push(`            ${n}: new Prisma.Decimal(dto.${n}),`);
      } else {
        createDataLines.push(`            ${n}: dto.${n} !== undefined ? new Prisma.Decimal(dto.${n}) : undefined,`);
      }
      updateDataLines.push(`            ${n}: dto.${n} !== undefined ? new Prisma.Decimal(dto.${n}) : undefined,`);
    } else if (f.type === 'json') {
      jsonFields.push(n);
      if (f.required) {
        createDataLines.push(`            ${n}: dto.${n} as Prisma.InputJsonValue,`);
      } else {
        createDataLines.push(`            ${n}: dto.${n} !== undefined ? (dto.${n} as Prisma.InputJsonValue) : undefined,`);
      }
      updateDataLines.push(`            ${n}: dto.${n} !== undefined ? (dto.${n} as Prisma.InputJsonValue) : undefined,`);
    } else if (n === 'instituteId') {
      createDataLines.push(`            ${n}: dto.${n},`);
      // instituteId is not in update DTO
    } else if (f.required) {
      createDataLines.push(`            ${n}: dto.${n},`);
      updateDataLines.push(`            ${n}: dto.${n} ?? undefined,`);
    } else {
      createDataLines.push(`            ${n}: dto.${n} ?? undefined,`);
      updateDataLines.push(`            ${n}: dto.${n} !== undefined ? (dto.${n} ?? undefined) : undefined,`);
    }
  }

  // Build where clause for filters
  const whereLines = [];
  for (const f of mod.filters || []) {
    if (f.type === 'bool') {
      whereLines.push(`      ...(typeof query.${f.name} === 'boolean' ? { ${f.name}: query.${f.name} } : {}),`);
    } else if (f.type === 'int') {
      whereLines.push(`      ...(typeof query.${f.name} === 'number' ? { ${f.name}: query.${f.name} } : {}),`);
    } else {
      whereLines.push(`      ...(query.${f.name} ? { ${f.name}: query.${f.name} } : {}),`);
    }
  }

  // Search
  let searchBlock = '';
  if (mod.searchFields && mod.searchFields.length) {
    if (mod.searchFields.length === 1) {
      searchBlock = `      ...(query.search
        ? { ${mod.searchFields[0]}: { contains: query.search, mode: 'insensitive' } }
        : {}),`;
    } else {
      const ors = mod.searchFields.map(sf => `              { ${sf}: { contains: query.search, mode: 'insensitive' } },`).join('\n');
      searchBlock = `      ...(query.search
        ? {
            OR: [
${ors}
            ],
          }
        : {}),`;
    }
  }

  // Unique check
  let uniqueCheckMethod = '';
  let uniqueCallCreate = '';
  let uniqueCallUpdate = '';
  let uniqueCallRestore = '';
  if (mod.uniqueCheck) {
    const uf = mod.uniqueCheck.field;
    const scope = mod.uniqueCheck.scope;
    const ufField = mod.fields.find(f => f.name === uf);
    const ufType = ufField ? tsType(ufField) : 'string';
    const scopeField = mod.fields.find(f => f.name === scope);
    const scopeType = scopeField ? tsType(scopeField) : 'string';

    uniqueCheckMethod = `
  private async assert${toPascal(uf)}Unique(
    tx: Prisma.TransactionClient,
    ${scope}: ${scopeType},
    ${uf}: ${ufType},
    excludeId?: string,
  ) {
    const clash = await tx.${prismaModel}.findFirst({
      where: {
        ${scope},
        ${uf},
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        \`A ${pascal} with ${uf} "\${${uf}}" already exists.\`,
      );
    }
  }`;
    if (ufField && !ufField.required) {
      uniqueCallCreate = `      if (dto.${uf}) {\n        await this.assert${toPascal(uf)}Unique(tx, dto.${scope}, dto.${uf});\n      }\n`;
    } else {
      uniqueCallCreate = `      await this.assert${toPascal(uf)}Unique(tx, dto.${scope}, dto.${uf});\n`;
    }
    uniqueCallUpdate = `      if (dto.${uf} && dto.${uf} !== existing.${uf}) {
        await this.assert${toPascal(uf)}Unique(tx, existing.${scope}, dto.${uf}, id);
      }`;
    if (ufField && !ufField.required) {
      uniqueCallRestore = `      if (existing.${uf}) {\n        await this.assert${toPascal(uf)}Unique(tx, existing.${scope}, existing.${uf}, existing.id);\n      }`;
    } else {
      uniqueCallRestore = `      await this.assert${toPascal(uf)}Unique(tx, existing.${scope}, existing.${uf}, existing.id);`;
    }
  }

  const defaultSort = mod.defaultSort || 'createdAt';

  return `import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Create${pascal}Dto } from './dto/create-${singular}.dto';
import { List${pascalPlural}QueryDto } from './dto/list-${kebab}.query';
import { Update${pascal}Dto } from './dto/update-${singular}.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ${pascalPlural}Service {
  private readonly logger = new Logger(${pascalPlural}Service.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: Create${pascal}Dto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
${uniqueCallCreate}
      try {
        const record = await tx.${prismaModel}.create({
          data: {
${createDataLines.join('\n')}
          },
        });

        this.logger.log(\`${pascal} created: \${record.id}\`);
        return record;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: List${pascalPlural}QueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.${prismaModel}.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? '${defaultSort}';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.${PrismaModel}WhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
${whereLines.join('\n')}
${searchBlock}
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.${prismaModel}.count({ where }),
      this.prisma.${prismaModel}.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  // --------------------------------------------------------------------------
  // READ — single
  // --------------------------------------------------------------------------
  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const record = await this.prisma.${prismaModel}.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(\`${pascal} \${id} not found.\`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: Update${pascal}Dto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.${prismaModel}.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(\`${pascal} \${id} not found.\`);
      }

${uniqueCallUpdate}

      try {
        return await tx.${prismaModel}.update({
          where: { id },
          data: {
${updateDataLines.join('\n')}
          },
        });
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.${prismaModel}.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.${prismaModel}.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(\`${pascal} \${id} not found.\`);
      }
      if (!existing.deletedAt) return existing;

${uniqueCallRestore}

      return tx.${prismaModel}.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private async assertInstituteExists(
    tx: Prisma.TransactionClient,
    instituteId: string,
  ) {
    const inst = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!inst) {
      throw new NotFoundException(\`Institute \${instituteId} not found.\`);
    }
  }
${uniqueCheckMethod}

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A ${pascal} with the same unique fields already exists.',
      );
    }
  }
}
`;
}

// ─── Main: Generate all modules ────────────────────────────────────
let generated = 0;
let skipped = 0;

for (const mod of MODULES) {
  const dir = join(MODULES_DIR, mod.path);
  const dtoDir = join(dir, 'dto');
  
  // Skip check removed to overwrite with updated template fixes
  /*
  if (existsSync(join(dir, `${mod.path}.module.ts`))) {
    console.log(`⏭  Skipping ${mod.path} (already exists)`);
    skipped++;
    continue;
  }
  */
  
  mkdirSync(dtoDir, { recursive: true });
  
  const kebab = mod.path;
  const singular = kebab.endsWith('ies') ? kebab.slice(0,-3) + 'y' : 
                   kebab.endsWith('ses') ? kebab.slice(0,-2) :
                   kebab.endsWith('s') ? kebab.slice(0,-1) : kebab;
  const pascalPlural = toPascal(kebab);

  // Generate files
  writeFileSync(join(dir, `${kebab}.module.ts`), genModule(mod));
  writeFileSync(join(dir, `${kebab}.controller.ts`), genController(mod));
  writeFileSync(join(dir, `${kebab}.service.ts`), genService(mod));
  writeFileSync(join(dtoDir, `create-${singular}.dto.ts`), genCreateDto(mod));
  writeFileSync(join(dtoDir, `update-${singular}.dto.ts`), genUpdateDto(mod));
  writeFileSync(join(dtoDir, `list-${kebab}.query.ts`), genListQuery(mod));
  
  console.log(`✅ Generated ${mod.path} (6 files)`);
  generated++;
}

// ─── Update app.module.ts ──────────────────────────────────────────
console.log('\n--- Updating app.module.ts ---');

let appModule = readFileSync(APP_MODULE, 'utf-8');

const newImports = [];
const newModuleNames = [];

for (const mod of MODULES) {
  const kebab = mod.path;
  const pascalPlural = toPascal(kebab);
  const moduleName = `${pascalPlural}Module`;
  
  // Check if already imported
  if (appModule.includes(moduleName)) {
    continue;
  }
  
  newImports.push(`import { ${moduleName} } from './modules/${kebab}/${kebab}.module';`);
  newModuleNames.push(moduleName);
}

if (newImports.length > 0) {
  // Add imports before @Module decorator
  const moduleDecoratorIndex = appModule.indexOf('@Module({');
  appModule = appModule.slice(0, moduleDecoratorIndex) + 
              newImports.join('\n') + '\n\n' + 
              appModule.slice(moduleDecoratorIndex);
  
  // Add modules to imports array before AuthModule (last entry)
  const authModuleLine = '    AuthModule, ';
  if (appModule.includes(authModuleLine)) {
    appModule = appModule.replace(
      authModuleLine,
      newModuleNames.map(m => `    ${m},`).join('\n') + '\n' + authModuleLine
    );
  } else {
    // Try alternative: before the closing of imports array
    const authAlt = '    AuthModule,';
    if (appModule.includes(authAlt)) {
      appModule = appModule.replace(
        authAlt,
        newModuleNames.map(m => `    ${m},`).join('\n') + '\n' + authAlt
      );
    }
  }
  
  writeFileSync(APP_MODULE, appModule);
  console.log(`✅ Added ${newModuleNames.length} modules to app.module.ts`);
} else {
  console.log('⏭  app.module.ts already up to date');
}

console.log(`\n🎉 Done! Generated ${generated} modules (${skipped} skipped). Total files: ${generated * 6}`);
