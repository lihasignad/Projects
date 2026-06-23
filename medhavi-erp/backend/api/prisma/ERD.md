```mermaid
erDiagram

  "institutes" {

    }
  

  "campuses" {

    }
  

  "schools" {

    }
  

  "departments" {

    }
  

  "users" {

    }
  

  "roles" {

    }
  

  "permissions" {

    }
  

  "role_permissions" {

    }
  

  "user_roles" {

    }
  

  "user_scopes" {

    }
  

  "auth_credentials" {

    }
  

  "sessions" {

    }
  

  "login_attempts" {

    }
  

  "mfa_factors" {

    }
  

  "password_reset_tokens" {

    }
  

  "email_verification_tokens" {

    }
  

  "security_events" {

    }
  

  "audit_logs" {

    }
  

  "workflow_definitions" {

    }
  

  "workflow_steps" {

    }
  

  "workflow_instances" {

    }
  

  "workflow_actions" {

    }
  

  "notification_templates" {

    }
  

  "notifications" {

    }
  

  "notification_preferences" {

    }
  

  "file_objects" {

    }
  

  "file_access_grants" {

    }
  

  "settings" {

    }
  

  "academic_years" {

    }
  

  "terms" {

    }
  

  "programs" {

    }
  

  "batches" {

    }
  

  "sections" {

    }
  

  "subjects" {

    }
  

  "subject_prerequisites" {

    }
  

  "subject_offerings" {

    }
  

  "faculty" {

    }
  

  "faculty_assignments" {

    }
  

  "mentorships" {

    }
  

  "faculty_advisors" {

    }
  

  "advisor_students" {

    }
  

  "students" {

    }
  

  "rooms" {

    }
  

  "labs" {

    }
  

  "time_slots" {

    }
  

  "timetables" {

    }
  

  "timetable_entries" {

    }
  

  "class_sessions" {

    }
  

  "faculty_workloads" {

    }
  

  "courses" {

    }
  

  "course_enrollments" {

    }
  

  "course_modules" {

    }
  

  "lms_sessions" {

    }
  

  "resources" {

    }
  

  "discussion_threads" {

    }
  

  "discussion_comments" {

    }
  

  "attendance_sessions" {

    }
  

  "attendance_records" {

    }
  

  "assignment_categories" {

    }
  

  "assignments" {

    }
  

  "assignment_submissions" {

    }
  

  "quiz_banks" {

    }
  

  "quiz_questions" {

    }
  

  "quizzes" {

    }
  

  "quiz_attempts" {

    }
  

  "quiz_results" {

    }
  

  "exams" {

    }
  

  "exam_schedules" {

    }
  

  "invigilation_assignments" {

    }
  

  "hall_tickets" {

    }
  

  "marks_entries" {

    }
  

  "moderations" {

    }
  

  "results" {

    }
  

  "transcripts" {

    }
  

  "revaluation_requests" {

    }
  

  "registration_cycles" {

    }
  

  "course_registrations" {

    }
  

  "registration_subjects" {

    }
  

  "fee_structures" {

    }
  

  "invoices" {

    }
  

  "payments" {

    }
  

  "scholarships" {

    }
  

  "wallets" {

    }
  

  "wallet_transactions" {

    }
  

  "fee_waivers" {

    }
  

  "documents" {

    }
  

  "certificates" {

    }
  

  "help_center_articles" {

    }
  

  "tickets" {

    }
  

  "books" {

    }
  

  "book_copies" {

    }
  

  "book_issues" {

    }
  

  "book_reservations" {

    }
  

  "library_fines" {

    }
  

  "hostels" {

    }
  

  "hostel_rooms" {

    }
  

  "hostel_allocations" {

    }
  

  "hostel_leave_requests" {

    }
  

  "transport_routes" {

    }
  

  "transport_vehicles" {

    }
  

  "transport_stops" {

    }
  

  "transport_passes" {

    }
  

  "clubs" {

    }
  

  "club_memberships" {

    }
  

  "events" {

    }
  

  "event_registrations" {

    }
  

  "feedback" {

    }
  

  "companies" {

    }
  

  "placement_drives" {

    }
  

  "placement_applications" {

    }
  

  "placement_offers" {

    }
  

  "research_projects" {

    }
  

  "publications" {

    }
  

  "grants" {

    }
  

  "patents" {

    }
  

  "IdempotencyKey" {

    }
  

  "FeatureFlag" {

    }
  

  "InstituteFeatureFlag" {

    }
  

  "ApprovalEscalation" {

    }
  

  "MentorAssignment" {

    }
  

  "MentorSession" {

    }
  

  "OnlineExamMedia" {

    }
  

  "I18nString" {

    }
  

  "NotificationProviderConfig" {

    }
  
    "institutes" }o--|o file_objects : "logoFile"
    "campuses" }o--|| institutes : "institute"
    "schools" }o--|| campuses : "campus"
    "schools" }o--|o users : "dean"
    "schools" }o--|| institutes : "institute"
    "departments" }o--|| campuses : "campus"
    "departments" }o--|o users : "hod"
    "departments" }o--|| institutes : "institute"
    "departments" }o--|| schools : "school"
    "users" }o--|o file_objects : "avatarFile"
    "users" }o--|o institutes : "institute"
    "roles" }o--|o institutes : "institute"
    "role_permissions" }o--|| permissions : "permission"
    "role_permissions" }o--|| roles : "role"
    "user_roles" }o--|o users : "grantedBy"
    "user_roles" }o--|| roles : "role"
    "user_roles" }o--|| users : "user"
    "user_scopes" }o--|o users : "grantedBy"
    "user_scopes" }o--|| users : "user"
    "auth_credentials" }o--|| users : "user"
    "sessions" }o--|| users : "user"
    "login_attempts" }o--|o users : "user"
    "mfa_factors" }o--|| users : "user"
    "password_reset_tokens" }o--|| users : "user"
    "email_verification_tokens" }o--|| users : "user"
    "security_events" }o--|o users : "user"
    "audit_logs" }o--|o users : "actor"
    "audit_logs" }o--|o institutes : "institute"
    "workflow_definitions" }o--|o institutes : "institute"
    "workflow_steps" }o--|| workflow_definitions : "workflow"
    "workflow_instances" }o--|| users : "initiator"
    "workflow_instances" }o--|| workflow_definitions : "workflow"
    "workflow_actions" }o--|| users : "actor"
    "workflow_actions" }o--|| workflow_instances : "instance"
    "workflow_actions" }o--|o workflow_steps : "step"
    "notifications" }o--|| institutes : "institute"
    "notifications" }o--|| users : "recipient"
    "notification_preferences" }o--|| users : "user"
    "file_objects" }o--|o institutes : "institute"
    "file_objects" }o--|o users : "uploadedBy"
    "file_access_grants" }o--|| file_objects : "file"
    "file_access_grants" }o--|| users : "grantedBy"
    "file_access_grants" }o--|o users : "grantedTo"
    "settings" }o--|o institutes : "institute"
    "settings" }o--|o users : "updatedBy"
    "academic_years" }o--|| institutes : "institute"
    "terms" }o--|| academic_years : "academicYear"
    "terms" }o--|| institutes : "institute"
    "programs" }o--|o campuses : "campus"
    "programs" }o--|| departments : "department"
    "programs" }o--|| institutes : "institute"
    "programs" }o--|| schools : "school"
    "batches" }o--|| academic_years : "academicYear"
    "batches" }o--|| institutes : "institute"
    "batches" }o--|| programs : "program"
    "sections" }o--|| batches : "batch"
    "sections" }o--|o faculty : "classAdvisor"
    "sections" }o--|o users : "classRep"
    "sections" }o--|| institutes : "institute"
    "sections" }o--|| terms : "term"
    "subjects" }o--|| departments : "department"
    "subjects" }o--|| institutes : "institute"
    "subjects" }o--|o programs : "program"
    "subjects" }o--|o file_objects : "syllabusFile"
    "subject_prerequisites" }o--|| subjects : "prerequisite"
    "subject_prerequisites" }o--|| subjects : "subject"
    "subject_offerings" }o--|| departments : "department"
    "subject_offerings" }o--|| institutes : "institute"
    "subject_offerings" }o--|o programs : "program"
    "subject_offerings" }o--|o sections : "section"
    "subject_offerings" }o--|| subjects : "subject"
    "subject_offerings" }o--|o file_objects : "syllabusFile"
    "subject_offerings" }o--|| terms : "term"
    "faculty" }o--|o campuses : "campus"
    "faculty" }o--|| departments : "department"
    "faculty" }o--|| institutes : "institute"
    "faculty" }o--|o file_objects : "profilePhoto"
    "faculty" |o--|o faculty : "reportsTo"
    "faculty" }o--|| schools : "school"
    "faculty" |o--|| users : "user"
    "faculty_assignments" }o--|o users : "approvedBy"
    "faculty_assignments" }o--|o users : "assignedBy"
    "faculty_assignments" }o--|| faculty : "faculty"
    "faculty_assignments" }o--|| institutes : "institute"
    "faculty_assignments" }o--|| subject_offerings : "subjectOffering"
    "mentorships" }o--|o academic_years : "academicYear"
    "mentorships" }o--|o users : "assignedBy"
    "mentorships" }o--|| institutes : "institute"
    "mentorships" }o--|| faculty : "mentor"
    "mentorships" }o--|| students : "student"
    "faculty_advisors" }o--|o academic_years : "academicYear"
    "faculty_advisors" }o--|o users : "assignedBy"
    "faculty_advisors" }o--|| faculty : "faculty"
    "faculty_advisors" }o--|| institutes : "institute"
    "advisor_students" }o--|o academic_years : "academicYear"
    "advisor_students" }o--|| faculty : "advisorFaculty"
    "advisor_students" }o--|o users : "assignedBy"
    "advisor_students" }o--|| faculty_advisors : "facultyAdvisor"
    "advisor_students" }o--|| institutes : "institute"
    "advisor_students" }o--|| students : "student"
    "students" }o--|| batches : "batch"
    "students" }o--|| institutes : "institute"
    "students" }o--|| programs : "program"
    "students" }o--|o sections : "section"
    "students" |o--|| users : "user"
    "rooms" }o--|o campuses : "campus"
    "rooms" }o--|| institutes : "institute"
    "labs" }o--|o campuses : "campus"
    "labs" }o--|| institutes : "institute"
    "time_slots" }o--|| institutes : "institute"
    "timetables" }o--|| institutes : "institute"
    "timetables" }o--|o users : "publishedBy"
    "timetables" }o--|| sections : "section"
    "timetables" }o--|| terms : "term"
    "timetable_entries" }o--|o faculty_assignments : "facultyAssignment"
    "timetable_entries" }o--|| institutes : "institute"
    "timetable_entries" }o--|o labs : "lab"
    "timetable_entries" }o--|| faculty : "primaryFaculty"
    "timetable_entries" }o--|o rooms : "room"
    "timetable_entries" }o--|| subject_offerings : "subjectOffering"
    "timetable_entries" }o--|| time_slots : "timeSlot"
    "timetable_entries" }o--|| timetables : "timetable"
    "class_sessions" }o--|| faculty : "faculty"
    "class_sessions" }o--|| institutes : "institute"
    "class_sessions" }o--|o labs : "lab"
    "class_sessions" |o--|o class_sessions : "rescheduledTo"
    "class_sessions" }o--|o rooms : "room"
    "class_sessions" }o--|| sections : "section"
    "class_sessions" }o--|| subject_offerings : "subjectOffering"
    "class_sessions" }o--|o timetable_entries : "timetableEntry"
    "faculty_workloads" }o--|| faculty : "faculty"
    "faculty_workloads" }o--|| institutes : "institute"
    "faculty_workloads" }o--|| terms : "term"
    "courses" }o--|| institutes : "institute"
    "courses" }o--|| faculty : "ownerFaculty"
    "courses" }o--|o subject_offerings : "subjectOffering"
    "courses" }o--|o terms : "term"
    "course_enrollments" }o--|| courses : "course"
    "course_enrollments" }o--|| institutes : "institute"
    "course_enrollments" }o--|| students : "student"
    "course_modules" }o--|| courses : "course"
    "course_modules" }o--|| institutes : "institute"
    "course_modules" |o--|o course_modules : "parent"
    "lms_sessions" }o--|| institutes : "institute"
    "lms_sessions" }o--|| course_modules : "module"
    "resources" }o--|o courses : "course"
    "resources" }o--|o users : "createdBy"
    "resources" }o--|o file_objects : "fileObject"
    "resources" }o--|| institutes : "institute"
    "resources" }o--|o course_modules : "module"
    "resources" }o--|o lms_sessions : "session"
    "discussion_threads" }o--|| users : "author"
    "discussion_threads" }o--|| courses : "course"
    "discussion_threads" }o--|| institutes : "institute"
    "discussion_comments" }o--|| users : "author"
    "discussion_comments" }o--|| institutes : "institute"
    "discussion_comments" |o--|o discussion_comments : "parent"
    "discussion_comments" }o--|| discussion_threads : "thread"
    "attendance_sessions" |o--|| class_sessions : "classSession"
    "attendance_sessions" }o--|| faculty : "faculty"
    "attendance_sessions" }o--|| institutes : "institute"
    "attendance_sessions" }o--|| sections : "section"
    "attendance_sessions" }o--|| subject_offerings : "subjectOffering"
    "attendance_records" }o--|| attendance_sessions : "attendanceSession"
    "attendance_records" }o--|| institutes : "institute"
    "attendance_records" }o--|o users : "markedBy"
    "attendance_records" }o--|| students : "student"
    "assignment_categories" }o--|o courses : "course"
    "assignment_categories" }o--|| institutes : "institute"
    "assignment_categories" }o--|o subject_offerings : "subjectOffering"
    "assignments" }o--|o assignment_categories : "category"
    "assignments" }o--|o courses : "course"
    "assignments" }o--|| faculty : "createdByFaculty"
    "assignments" }o--|| institutes : "institute"
    "assignments" }o--|o subject_offerings : "subjectOffering"
    "assignment_submissions" }o--|| assignments : "assignment"
    "assignment_submissions" }o--|o faculty : "gradedByFaculty"
    "assignment_submissions" }o--|| institutes : "institute"
    "assignment_submissions" }o--|| students : "student"
    "quiz_banks" }o--|o courses : "course"
    "quiz_banks" }o--|| institutes : "institute"
    "quiz_banks" }o--|| faculty : "ownerFaculty"
    "quiz_banks" }o--|o subjects : "subject"
    "quiz_questions" }o--|| institutes : "institute"
    "quiz_questions" }o--|| quiz_banks : "quizBank"
    "quizzes" }o--|o courses : "course"
    "quizzes" }o--|| faculty : "createdByFaculty"
    "quizzes" }o--|| institutes : "institute"
    "quizzes" }o--|o quiz_banks : "quizBank"
    "quizzes" }o--|o subject_offerings : "subjectOffering"
    "quiz_attempts" }o--|| institutes : "institute"
    "quiz_attempts" }o--|| quizzes : "quiz"
    "quiz_attempts" }o--|| students : "student"
    "quiz_results" |o--|| quiz_attempts : "attempt"
    "quiz_results" }o--|o users : "gradedBy"
    "quiz_results" }o--|| institutes : "institute"
    "exams" }o--|o users : "controller"
    "exams" }o--|| institutes : "institute"
    "exams" }o--|o programs : "program"
    "exams" }o--|| terms : "term"
    "exam_schedules" }o--|| exams : "exam"
    "exam_schedules" }o--|| institutes : "institute"
    "exam_schedules" }o--|o rooms : "room"
    "exam_schedules" }o--|o sections : "section"
    "exam_schedules" }o--|| subject_offerings : "subjectOffering"
    "invigilation_assignments" }o--|| exam_schedules : "examSchedule"
    "invigilation_assignments" }o--|| faculty : "faculty"
    "invigilation_assignments" }o--|| institutes : "institute"
    "invigilation_assignments" }o--|o rooms : "room"
    "hall_tickets" }o--|| exams : "exam"
    "hall_tickets" }o--|o file_objects : "fileObject"
    "hall_tickets" }o--|| institutes : "institute"
    "hall_tickets" }o--|| students : "student"
    "marks_entries" }o--|o users : "approvedBy"
    "marks_entries" }o--|| faculty : "enteredByFaculty"
    "marks_entries" }o--|| exams : "exam"
    "marks_entries" }o--|| institutes : "institute"
    "marks_entries" }o--|| subject_offerings : "subjectOffering"
    "moderations" }o--|| institutes : "institute"
    "moderations" |o--|| marks_entries : "marksEntry"
    "moderations" }o--|| users : "moderator"
    "results" }o--|| exams : "exam"
    "results" }o--|| institutes : "institute"
    "results" }o--|| students : "student"
    "results" }o--|| subject_offerings : "subjectOffering"
    "transcripts" }o--|o file_objects : "fileObject"
    "transcripts" }o--|| institutes : "institute"
    "transcripts" }o--|o users : "issuedBy"
    "transcripts" }o--|| students : "student"
    "transcripts" }o--|o terms : "term"
    "revaluation_requests" }o--|o users : "decidedBy"
    "revaluation_requests" }o--|| exams : "exam"
    "revaluation_requests" }o--|| institutes : "institute"
    "revaluation_requests" }o--|o invoices : "invoice"
    "revaluation_requests" }o--|| results : "result"
    "revaluation_requests" }o--|| students : "student"
    "registration_cycles" }o--|| institutes : "institute"
    "registration_cycles" }o--|| terms : "term"
    "course_registrations" }o--|o users : "advisor"
    "course_registrations" }o--|| registration_cycles : "cycle"
    "course_registrations" }o--|o users : "hod"
    "course_registrations" }o--|| institutes : "institute"
    "course_registrations" }o--|| students : "student"
    "course_registrations" }o--|| terms : "term"
    "registration_subjects" }o--|| institutes : "institute"
    "registration_subjects" }o--|| course_registrations : "registration"
    "registration_subjects" }o--|| subject_offerings : "subjectOffering"
    "fee_structures" }o--|| academic_years : "academicYear"
    "fee_structures" }o--|o batches : "batch"
    "fee_structures" }o--|| institutes : "institute"
    "fee_structures" }o--|o programs : "program"
    "fee_structures" }o--|o terms : "term"
    "invoices" }o--|o fee_structures : "feeStructure"
    "invoices" }o--|| institutes : "institute"
    "invoices" }o--|| students : "student"
    "invoices" }o--|o terms : "term"
    "payments" }o--|| institutes : "institute"
    "payments" }o--|o invoices : "invoice"
    "payments" }o--|o users : "receivedBy"
    "payments" }o--|| students : "student"
    "scholarships" }o--|| academic_years : "academicYear"
    "scholarships" }o--|o users : "approvedBy"
    "scholarships" }o--|| institutes : "institute"
    "scholarships" }o--|| students : "student"
    "wallets" }o--|| institutes : "institute"
    "wallets" |o--|| students : "student"
    "wallet_transactions" }o--|o users : "createdBy"
    "wallet_transactions" }o--|| institutes : "institute"
    "wallet_transactions" }o--|o payments : "payment"
    "wallet_transactions" }o--|| wallets : "wallet"
    "fee_waivers" }o--|o users : "approvedBy"
    "fee_waivers" }o--|| institutes : "institute"
    "fee_waivers" }o--|o invoices : "invoice"
    "fee_waivers" }o--|| users : "requestedBy"
    "fee_waivers" }o--|| students : "student"
    "documents" }o--|| file_objects : "fileObject"
    "documents" }o--|| institutes : "institute"
    "documents" }o--|o users : "owner"
    "certificates" }o--|o file_objects : "fileObject"
    "certificates" }o--|| institutes : "institute"
    "certificates" }o--|o users : "issuedBy"
    "certificates" }o--|| students : "student"
    "help_center_articles" }o--|o users : "author"
    "help_center_articles" }o--|| institutes : "institute"
    "tickets" }o--|o users : "assignedTo"
    "tickets" }o--|| institutes : "institute"
    "tickets" }o--|| users : "raisedBy"
    "tickets" }o--|o students : "student"
    "books" }o--|| institutes : "institute"
    "book_copies" }o--|| books : "book"
    "book_copies" }o--|| institutes : "institute"
    "book_issues" }o--|| book_copies : "bookCopy"
    "book_issues" }o--|| users : "borrower"
    "book_issues" }o--|| institutes : "institute"
    "book_issues" }o--|| users : "issuedBy"
    "book_issues" }o--|o users : "returnedBy"
    "book_issues" }o--|o students : "student"
    "book_reservations" }o--|| books : "book"
    "book_reservations" }o--|| institutes : "institute"
    "book_reservations" }o--|| users : "reservedBy"
    "book_reservations" }o--|o students : "student"
    "library_fines" }o--|o book_issues : "bookIssue"
    "library_fines" }o--|| institutes : "institute"
    "library_fines" }o--|o students : "student"
    "library_fines" }o--|| users : "user"
    "library_fines" }o--|o users : "waivedBy"
    "hostels" }o--|o campuses : "campus"
    "hostels" }o--|| institutes : "institute"
    "hostels" }o--|o users : "warden"
    "hostel_rooms" }o--|| hostels : "hostel"
    "hostel_rooms" }o--|| institutes : "institute"
    "hostel_allocations" }o--|| academic_years : "academicYear"
    "hostel_allocations" }o--|o users : "allocatedBy"
    "hostel_allocations" }o--|| hostels : "hostel"
    "hostel_allocations" }o--|| hostel_rooms : "hostelRoom"
    "hostel_allocations" }o--|| institutes : "institute"
    "hostel_allocations" }o--|| students : "student"
    "hostel_leave_requests" }o--|o users : "approvedBy"
    "hostel_leave_requests" }o--|| hostels : "hostel"
    "hostel_leave_requests" }o--|| institutes : "institute"
    "hostel_leave_requests" }o--|| students : "student"
    "transport_routes" }o--|| institutes : "institute"
    "transport_vehicles" }o--|| institutes : "institute"
    "transport_vehicles" }o--|o transport_routes : "route"
    "transport_stops" }o--|| institutes : "institute"
    "transport_stops" }o--|| transport_routes : "route"
    "transport_passes" }o--|| academic_years : "academicYear"
    "transport_passes" }o--|| institutes : "institute"
    "transport_passes" }o--|| transport_routes : "route"
    "transport_passes" }o--|o transport_stops : "stop"
    "transport_passes" }o--|| students : "student"
    "clubs" }o--|o faculty : "advisor"
    "clubs" }o--|| institutes : "institute"
    "clubs" }o--|o users : "president"
    "club_memberships" }o--|| clubs : "club"
    "club_memberships" }o--|| institutes : "institute"
    "club_memberships" }o--|| students : "student"
    "events" }o--|o clubs : "club"
    "events" }o--|| institutes : "institute"
    "events" }o--|| users : "organizer"
    "event_registrations" }o--|| events : "event"
    "event_registrations" }o--|| institutes : "institute"
    "event_registrations" }o--|o students : "student"
    "event_registrations" }o--|| users : "user"
    "feedback" }o--|| institutes : "institute"
    "feedback" }o--|o students : "student"
    "feedback" }o--|| users : "submittedBy"
    "feedback" }o--|o terms : "term"
    "companies" }o--|| institutes : "institute"
    "placement_drives" }o--|| academic_years : "academicYear"
    "placement_drives" }o--|| companies : "company"
    "placement_drives" }o--|o users : "coordinator"
    "placement_drives" }o--|| institutes : "institute"
    "placement_applications" }o--|| placement_drives : "drive"
    "placement_applications" }o--|| institutes : "institute"
    "placement_applications" }o--|o file_objects : "resumeFile"
    "placement_applications" }o--|| students : "student"
    "placement_offers" }o--|| placement_applications : "application"
    "placement_offers" }o--|| companies : "company"
    "placement_offers" }o--|| placement_drives : "drive"
    "placement_offers" }o--|| institutes : "institute"
    "placement_offers" }o--|o file_objects : "offerLetterFile"
    "placement_offers" }o--|| students : "student"
    "research_projects" }o--|o departments : "department"
    "research_projects" }o--|| institutes : "institute"
    "research_projects" }o--|| faculty : "pi"
    "publications" }o--|o file_objects : "fileObject"
    "publications" }o--|| institutes : "institute"
    "publications" }o--|o faculty : "primaryAuthor"
    "publications" }o--|o research_projects : "project"
    "grants" }o--|| institutes : "institute"
    "grants" }o--|| faculty : "pi"
    "grants" }o--|o research_projects : "project"
    "patents" }o--|o file_objects : "fileObject"
    "patents" }o--|| institutes : "institute"
    "patents" }o--|o faculty : "primaryInventor"
    "patents" }o--|o research_projects : "project"
    "IdempotencyKey" }o--|o institutes : "institute"
    "IdempotencyKey" }o--|| users : "user"
    "InstituteFeatureFlag" }o--|| "FeatureFlag" : "flag"
    "InstituteFeatureFlag" }o--|| institutes : "institute"
    "ApprovalEscalation" }o--|| workflow_instances : "instance"
    "ApprovalEscalation" }o--|| institutes : "institute"
    "ApprovalEscalation" }o--|o users : "resolvedBy"
    "MentorAssignment" }o--|| institutes : "institute"
    "MentorAssignment" }o--|| faculty : "mentor"
    "MentorAssignment" }o--|| students : "student"
    "MentorSession" }o--|| "MentorAssignment" : "assignment"
    "MentorSession" }o--|| faculty : "mentor"
    "OnlineExamMedia" }o--|| exams : "exam"
    "OnlineExamMedia" }o--|| institutes : "institute"
    "NotificationProviderConfig" }o--|| institutes : "institute"
```
