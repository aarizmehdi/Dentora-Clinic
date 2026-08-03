There are several issues with the current Settings module. Before implementing any changes, carefully analyze the existing Settings architecture and determine which settings are actually being used throughout the application and which ones are currently unused or duplicated.

The objective is to simplify the Settings page, remove redundant fields, improve logical organization, and ensure every setting has a real purpose within the system.

Do not blindly follow this specification. First inspect the codebase and identify which settings are actually consumed by the application. If a setting is never used, either remove it or relocate it to a more appropriate section.

---

# 1. System Preferences

Currently, System Preferences contains:

- Default Time Zone
- Time Format (12/24 Hour)
- Default Currency

While Clinic & Locations contains:

- Country

This organization is not logical.

The country should become the primary regional setting because it determines the clinic's localization.

Move the Country selection into System Preferences.

Once a country is selected, the system should automatically determine and apply:

- Default Currency
- Default Time Zone

These should no longer require manual configuration.

Remove the separate "Default Currency" and "Default Time Zone" settings unless there is a valid technical reason to keep them as advanced overrides.

The only user-selectable formatting option should remain:

- Time Format (12 Hour / 24 Hour)

---

# 2. Global Localization

The selected country should become the application's localization source.

Once changed, the entire application should automatically use:

- Correct currency symbol
- Currency formatting
- Default time zone
- Date/time localization where appropriate

Additionally, if the user changes the Time Format (12/24 Hour), ensure that this preference is respected across the entire application.

No page should continue displaying the old format.

This should include, but not be limited to:

- Dashboard
- Appointments
- Visit History
- Billing
- Invoices
- Reports
- PDF exports

The selected format should be the single source of truth.

---

# 3. Clinic & Locations Cleanup

Review every field inside Clinic & Locations.

Currently it contains fields such as:

- Clinic Name
- Tax ID
- Administrator Name
- Primary Dentist Name
- Contact Number
- Email Address
- Clinic Address

Then below it contains Locations with:

- Location Name
- Location Code
- Phone Number
- Operating Hours
- Address

From reviewing the application, the Location information appears to be the data actually used throughout invoices and clinic workflows.

Before making changes, verify which fields are actually consumed by the application.

If fields such as:

- Administrator Name
- Primary Dentist Name
- Email Address
- Contact Number
- Clinic Address

are currently unused or duplicated, remove them from this section.

Avoid storing the same information in multiple places.

There should be a single authoritative source for each type of data.

---

# 4. User & Staff Management

Administrator information and Dentist information should not belong inside Clinic Settings.

Create a dedicated section for managing people.

Examples:

Users

or

Staff Management

This section should manage application users rather than clinic information.

Initially support two roles:

Administrator

Responsible for:

- Managing the clinic
- System configuration
- Settings
- Doctors
- Billing
- Locations

Dentist

Responsible for:

- Appointments
- Active Visits
- Clinical Charting
- AI Clinical Scribe
- SOAP Notes
- Prescriptions
- Clinical Treatments

Administrators should be able to:

- Add Dentists
- Edit Dentists
- Remove Dentists
- Manage user access

Design the architecture so additional staff roles can easily be added in the future if required.

---

# 5. Remove Dummy Settings

Review the entire Settings module.

Identify:

- Placeholder fields
- Demo fields
- Duplicate fields
- Unused settings

If a setting has no functional purpose anywhere in the application, remove it.

Every visible setting should have a clear purpose and should affect some part of the system.

Avoid presenting users with configuration options that have no real effect.

---

# 6. General Requirements

Do not redesign the application.

Do not break existing functionality.

Do not remove settings that are actively used without replacing their functionality.

Prefer simplification over adding more options.

Follow the existing design language.

Reuse existing components where possible.

Before implementing any UI changes, inspect the current codebase to understand which settings are actually connected to application logic and which are simply placeholder values.

If there is a cleaner architecture for organizing Settings while preserving the current functionality, implement that approach instead.