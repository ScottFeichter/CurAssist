// ============================================================
// SAMPLE PAYLOAD — living reference for the submit JSON shape
// Update this as the structure is finalized
//
// DOM COLLECTION NOTES:
//   locations  — collected from data-* attrs on each child <div> in #organization_locations / #service_locations
//                (template must set data-name, data-addr1, data-addr2, data-city, data-state, data-zip on append)
//   phones     — collected from data-* attrs on each child <li> in #organization_phones
//                (template must set data-name, data-number on append)
//   notes      — collected from li.textContent in #organization_notes / #service_markdown_notes
//   categories — collected from .Select-value-label text inside #service_top_categories etc.
//   eligibs    — same pattern as categories
// ============================================================

// ----- SERVICE MODE (Organization = false) -----
const serviceSample = {
  service: {
    service_belongs_to_org: "123",
    service_internal_notes: "Some internal note",
    service_name: "Food Pantry",
    service_alternate_name: "The Pantry",
    service_email: "pantry@example.org",
    service_description: "Provides food to those in need.",
    service_short_description: "Food assistance.",
    service_application_process: "Walk in during open hours.",
    service_required_documents: "Photo ID",
    service_interpretation_services: "Spanish available",
    service_clinician_actions: "Refer client to intake desk",
    service_cost: "Free",
    service_wait_time: "None",
    service_website: "http://example.org",

    // Locations — array of location objects (collected via data-* attrs on each child div)
    service_locations: [
      {
        location_name: "Main Site",
        address_1: "123 Main St",
        address_2: "Suite 1",
        city: "San Francisco",
        state: "CA",
        zip: "94102"
      }
    ],

    // Phones — array of phone objects (collected via data-* attrs on each child li)
    service_phones: [
      {
        phone_name: "Main",
        phone_number: "415-555-1234"
      }
    ],

    // Hours — keyed by day abbreviation, start/end with time (HH:MM) and derived meridiem
    service_hours: {
      M:  { start: { time: "09:00", meridiem: "AM" }, end: { time: "17:00", meridiem: "PM" } },
      T:  { start: { time: "09:00", meridiem: "AM" }, end: { time: "17:00", meridiem: "PM" } },
      W:  { start: { time: "09:00", meridiem: "AM" }, end: { time: "17:00", meridiem: "PM" } },
      Th: { start: { time: "09:00", meridiem: "AM" }, end: { time: "17:00", meridiem: "PM" } },
      F:  { start: { time: "09:00", meridiem: "AM" }, end: { time: "17:00", meridiem: "PM" } },
      Sa: { start: { time: "",      meridiem: ""    }, end: { time: "",      meridiem: ""    } },
      Su: { start: { time: "",      meridiem: ""    }, end: { time: "",      meridiem: ""    } }
    },

    // Eligibilities — top and sub as arrays of selected label strings
    service_top_eligibilities: ["Adults", "Families"],
    service_sub_eligibilities: ["Low Income"],

    // Categories — top and sub as arrays of selected label strings
    service_top_categories: ["Food"],
    service_sub_categories: ["Food Pantry"],

    // Notes — array of note strings
    service_markdown_notes: ["Updated 2025-01-01: hours changed"]
  }
};


// ----- ORGANIZATION MODE (Organization = true) -----
const organizationSample = {
  organization: {
    organization_internal_notes: "Some internal note",
    organization_name: "SF Food Bank",
    organization_alternate_name: "SFFB",
    organization_website: "http://sffoodbank.org",
    organization_email: "info@sffoodbank.org",
    organization_description: "Provides food assistance across SF.",
    organization_legal_status: "non-profit",

    // Locations — array of location objects (collected via data-* attrs on each child div)
    organization_locations: [
      {
        location_name: "HQ",
        address_1: "900 Pennsylvania Ave",
        address_2: "",
        city: "San Francisco",
        state: "CA",
        zip: "94107"
      }
    ],

    // Phones — array of phone objects (collected via data-* attrs on each child li)
    organization_phones: [
      {
        phone_name: "Main",
        phone_number: "415-555-1234"
      }
    ],

    // Services embedded in org — 0, 1, or many
    // Each service has same shape as serviceSample.service but WITHOUT service_belongs_to_org
    services: {
      service_1: {
        service_internal_notes: "",
        service_name: "Hot Meals",
        service_alternate_name: "",
        service_email: "",
        service_description: "Daily hot meals served on site.",
        service_short_description: "",
        service_application_process: "",
        service_required_documents: "",
        service_interpretation_services: "",
        service_clinician_actions: "",
        service_cost: "Free",
        service_wait_time: "",
        service_website: "",
        service_locations: [],
        service_hours: {
          M:  { start: { time: "11:00", meridiem: "AM" }, end: { time: "13:00", meridiem: "PM" } },
          T:  { start: { time: "11:00", meridiem: "AM" }, end: { time: "13:00", meridiem: "PM" } },
          W:  { start: { time: "",      meridiem: ""    }, end: { time: "",      meridiem: ""    } },
          Th: { start: { time: "",      meridiem: ""    }, end: { time: "",      meridiem: ""    } },
          F:  { start: { time: "11:00", meridiem: "AM" }, end: { time: "13:00", meridiem: "PM" } },
          Sa: { start: { time: "",      meridiem: ""    }, end: { time: "",      meridiem: ""    } },
          Su: { start: { time: "",      meridiem: ""    }, end: { time: "",      meridiem: ""    } }
        },
        service_top_eligibilities: [],
        service_sub_eligibilities: [],
        service_top_categories: ["Food"],
        service_sub_categories: ["Hot Meals"],
        service_markdown_notes: []
      }
      // service_2: { ... }, service_3: { ... }, etc.
    }
  }
};
