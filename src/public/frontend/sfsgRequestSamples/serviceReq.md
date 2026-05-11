Request URL
https://www.sfserviceguide.org/api/resources/1241/services
Request Method
POST
Status Code
201 Created
Remote Address
104.26.1.229:443
Referrer Policy
strict-origin-when-cross-origin

Request Headers
:authority
www.sfserviceguide.org
:method
POST
:path
/api/resources/1241/services
:scheme
https
accept
application/json
accept-encoding
gzip, deflate, br, zstd
accept-language
en-US,en;q=0.9
content-length
459
content-type
application/json
cookie
intercom-id-w50oz3tb=ee33f12f-ba64-4749-b04e-19ea7ad34169; intercom-device-id-w50oz3tb=d73390ef-2995-4c74-a922-e86c65d0ead9; _ga_JNEZ9M5BDR=deleted; _ga_91R319RLN0=deleted; _ga_91R319RLN0=deleted; _ga_JNEZ9M5BDR=GS2.1.s1770321811$o13$g1$t1770329286$j36$l0$h0; intercom-session-w50oz3tb=; _gid=GA1.2.1331452692.1773363689; _ga_JNEZ9M5BDR=GS2.1.s1773363689$o29$g1$t1773364638$j59$l0$h0; _ga=GA1.2.1549019742.1762815827; _gat_UA-116318550-1=1; _ga_91R319RLN0=GS2.1.s1773363688$o57$g1$t1773364642$j55$l0$h0
origin
https://www.sfserviceguide.org
priority
u=1, i
referer
https://www.sfserviceguide.org/organizations/1241/edit
sec-ch-ua
"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"
sec-ch-ua-mobile
?0
sec-ch-ua-platform
"macOS"
sec-fetch-dest
empty
sec-fetch-mode
cors
sec-fetch-site
same-origin
user-agent
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
﻿
﻿

Payload
{
    "services": [
        {
            "id": -2,
            "notes": [],
            "schedule": {
                "schedule_days": []
            },
            "shouldInheritScheduleFromParent": true,
            "name": "some test service"
        },
        {
            "id": -3,
            "notes": [],
            "schedule": {
                "schedule_days": []
            },
            "shouldInheritScheduleFromParent": true,
            "name": "some test service with eligibilities and categories",
            "eligibilities": [
                {
                    "name": "Abuse or Neglect Survivors",
                    "id": 1068,
                    "feature_rank": null
                }
            ],
            "categories": [
                {
                    "name": "Academic Support",
                    "id": 345,
                    "top_level": false,
                    "featured": false
                }
            ]
        }
    ]
}

Preview
{
    "services": [
        {
            "service": {
                "updated_at": "2026-03-13T01:18:16.083Z",
                "alternate_name": null,
                "application_process": null,
                "certified": false,
                "eligibility": null,
                "email": null,
                "fee": null,
                "id": 5519,
                "interpretation_services": null,
                "long_description": null,
                "name": "some test service",
                "required_documents": null,
                "short_description": null,
                "url": null,
                "verified_at": null,
                "wait_time": null,
                "certified_at": null,
                "featured": null,
                "source_attribution": "ask_darcel",
                "status": "approved",
                "internal_note": null,
                "schedule": {
                    "id": 6570,
                    "schedule_days": [],
                    "hours_known": true
                },
                "notes": [],
                "categories": [],
                "addresses": [],
                "eligibilities": [],
                "instructions": [],
                "documents": []
            }
        },
        {
            "service": {
                "updated_at": "2026-03-13T01:18:16.089Z",
                "alternate_name": null,
                "application_process": null,
                "certified": false,
                "eligibility": null,
                "email": null,
                "fee": null,
                "id": 5520,
                "interpretation_services": null,
                "long_description": null,
                "name": "some test service with eligibilities and categories",
                "required_documents": null,
                "short_description": null,
                "url": null,
                "verified_at": null,
                "wait_time": null,
                "certified_at": null,
                "featured": null,
                "source_attribution": "ask_darcel",
                "status": "approved",
                "internal_note": null,
                "schedule": {
                    "id": 6571,
                    "schedule_days": [],
                    "hours_known": true
                },
                "notes": [],
                "categories": [
                    {
                        "name": "Academic Support",
                        "id": 345,
                        "top_level": false,
                        "featured": false
                    }
                ],
                "addresses": [],
                "eligibilities": [
                    {
                        "name": "Abuse or Neglect Survivors",
                        "id": 1068,
                        "feature_rank": null
                    }
                ],
                "instructions": [],
                "documents": []
            }
        }
    ]
}
