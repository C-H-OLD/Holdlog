export const index = {
  "http": {
    "FieldError": "contractCheck0",
    "Error": "contractCheck1",
    "MutationResult": "contractCheck2",
    "DeleteResult": "contractCheck3",
    "EmptyResult": "contractCheck4",
    "VersionInput": "contractCheck5",
    "Profile": "contractCheck6",
    "ProfileInput": "contractCheck7",
    "LoginChallenge": "contractCheck8",
    "LoginInput": "contractCheck9",
    "MobileSession": "contractCheck10",
    "RefreshInput": "contractCheck11",
    "AdminLoginInput": "contractCheck12",
    "AdminSession": "contractCheck13",
    "SelectedCrew": "contractCheck14",
    "SelectedCrewInput": "contractCheck15",
    "Crew": "contractCheck16",
    "CrewInput": "contractCheck17",
    "Member": "contractCheck18",
    "InvitePreview": "contractCheck19",
    "InviteResolveInput": "contractCheck20",
    "Invite": "contractCheck21",
    "JoinInput": "contractCheck22",
    "TransferInput": "contractCheck23",
    "AccountLifecyclePreview": "contractCheck24",
    "Grade": "contractCheck25",
    "GradeInput": "contractCheck26",
    "Brand": "contractCheck27",
    "BrandInput": "contractCheck28",
    "Wall": "contractCheck29",
    "Setting": "contractCheck30",
    "SettingInput": "contractCheck31",
    "Gym": "contractCheck32",
    "GymInput": "contractCheck33",
    "NewWall": "contractCheck34",
    "GymCreateInput": "contractCheck35",
    "GymDetail": "contractCheck36",
    "Schedule": "contractCheck37",
    "ScheduleInput": "contractCheck38",
    "ResponseInput": "contractCheck39",
    "ScheduleMemberResponse": "contractCheck40",
    "ScheduleDetail": "contractCheck41",
    "ClimbCount": "contractCheck42",
    "ClimbDisplay": "contractCheck43",
    "AttachmentEdit": "contractCheck44",
    "PersonalRecordInput": "contractCheck45",
    "PersonalRecordUpdate": "contractCheck46",
    "ActiveLink": "contractCheck47",
    "Media": "contractCheck48",
    "OwnerRecord": "contractCheck49",
    "PublicMedia": "contractCheck50",
    "PublicRecord": "contractCheck51",
    "RecordCandidate": "contractCheck52",
    "Attendee": "contractCheck53",
    "CrewVisit": "contractCheck54",
    "VisitInput": "contractCheck55",
    "VisitUpdate": "contractCheck56",
    "LinkInput": "contractCheck57",
    "LinkResult": "contractCheck58",
    "BrowseRow": "contractCheck59",
    "RecordCalendar": "contractCheck60",
    "ScheduleCalendar": "contractCheck61",
    "Period": "contractCheck62",
    "StatsBucket": "contractCheck63",
    "GymStats": "contractCheck64",
    "GradeStats": "contractCheck65",
    "ConditionPoint": "contractCheck66",
    "ConditionBucket": "contractCheck67",
    "Statistics": "contractCheck68",
    "RecommendationItem": "contractCheck69",
    "Recommendations": "contractCheck70",
    "HistoryChange": "contractCheck71",
    "HistoryEvent": "contractCheck72",
    "NotificationSettings": "contractCheck73",
    "NotificationSettingsInput": "contractCheck74",
    "DeviceInput": "contractCheck75",
    "Device": "contractCheck76",
    "Announcement": "contractCheck77",
    "AnnouncementInput": "contractCheck78",
    "AssetDraftInput": "contractCheck79",
    "AssetDraft": "contractCheck80",
    "MediaCreateInput": "contractCheck81",
    "UploadTicket": "contractCheck82",
    "WorkoutFinishInput": "contractCheck83",
    "CrewPage": "contractCheck84",
    "MemberPage": "contractCheck85",
    "GymPage": "contractCheck86",
    "BrandPage": "contractCheck87",
    "SettingPage": "contractCheck88",
    "SchedulePage": "contractCheck89",
    "OwnerRecordPage": "contractCheck90",
    "RecordCandidatePage": "contractCheck91",
    "BrowseRowPage": "contractCheck92",
    "PublicRecordPage": "contractCheck93",
    "HistoryEventPage": "contractCheck94",
    "MediaPage": "contractCheck95",
    "AnnouncementPage": "contractCheck96",
    "AnnouncementList": "contractCheck97",
    "CatalogDetail": "contractCheck98",
    "Actor": "contractCheck99",
    "HistoryTimeChange": "contractCheck100",
    "HistoryTextChange": "contractCheck101",
    "HistoryIdChange": "contractCheck102",
    "HistoryAttendeeChange": "contractCheck103",
    "ProfileDraftInput": "contractCheck104",
    "AdminDraftInput": "contractCheck105",
    "AttendanceSelection": "contractCheck106",
    "NotificationItem": "contractCheck107",
    "NotificationPage": "contractCheck108",
    "NotificationReadInput": "contractCheck109",
    "NotificationReadResult": "contractCheck110",
    "NotificationReadAllResult": "contractCheck111"
  },
  "runtime": {
    "ClimbCount": "contractCheck112",
    "WorkoutDraft": "contractCheck113",
    "WorkoutLifecycle": "contractCheck114",
    "WorkoutDisplay": "contractCheck115",
    "AnnouncementSuppression": "contractCheck116",
    "PendingInvite": "contractCheck117",
    "Route": "contractCheck118",
    "PushPayload": "contractCheck119",
    "NoticeEntry": "contractCheck120",
    "OpenSourceManifest": "contractCheck121",
    "MediaJob": "contractCheck122",
    "NotificationJob": "contractCheck123",
    "DomainEvent": "contractCheck124",
    "StorageObjectRef": "contractCheck125",
    "StorageStart": "contractCheck126",
    "StorageAppend": "contractCheck127",
    "StorageComplete": "contractCheck128",
    "StorageCancel": "contractCheck129",
    "StorageRead": "contractCheck130",
    "StorageStat": "contractCheck131",
    "StorageDelete": "contractCheck132",
    "StorageResult": "contractCheck133"
  },
  "operations": {
    "createLoginChallenge": {
      "path": "/auth/challenges",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck8",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "login": {
      "path": "/auth/sessions",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck9",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck10",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "refreshSession": {
      "path": "/auth/sessions/refresh",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck11",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck10",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "logout": {
      "path": "/auth/sessions/current",
      "method": "delete",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck4",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminLogin": {
      "path": "/admin/auth/sessions",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck12",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck13",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminSession": {
      "path": "/admin/auth/sessions/current",
      "method": "get",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck13",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminLogout": {
      "path": "/admin/auth/sessions/current",
      "method": "delete",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck4",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "getMyProfile": {
      "path": "/me",
      "method": "get",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck6",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "editMyProfile": {
      "path": "/me",
      "method": "patch",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck7",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck6",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "deleteAccount": {
      "path": "/me",
      "method": "delete",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck3",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "getSelectedCrew": {
      "path": "/me/selected-crew",
      "method": "get",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck14",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "selectCrew": {
      "path": "/me/selected-crew",
      "method": "put",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck15",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck14",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "myCrews": {
      "path": "/me/crews",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck84",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "createCrew": {
      "path": "/crews",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck17",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck16",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "getCrew": {
      "path": "/crews/{crewId}",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck16",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "crewMembers": {
      "path": "/crews/{crewId}/members",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "q",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck85",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "resolveInvite": {
      "path": "/invites/resolve",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck20",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck19",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "joinCrew": {
      "path": "/crews/join",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck22",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck16",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "getCrewInvite": {
      "path": "/crews/{crewId}/invite",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck21",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "transferAdministrator": {
      "path": "/crews/{crewId}/administrator",
      "method": "put",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck23",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck16",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "previewAccountDeletion": {
      "path": "/me/account-deletion-preview",
      "method": "get",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck24",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "previewLeaveCrew": {
      "path": "/crews/{crewId}/leave-preview",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck24",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "leaveCrew": {
      "path": "/crews/{crewId}/my-membership",
      "method": "delete",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck4",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "listBrands": {
      "path": "/brands",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck87",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "searchGyms": {
      "path": "/gyms",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "q",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "brandId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "bounds",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "description": "west,south,east,north. 경도/위도 범위; 날짜선 횡단 허용"
          },
          "validator": "contractCheck138"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck86",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "gymDetail": {
      "path": "/gyms/{gymId}",
      "method": "get",
      "parameters": [
        {
          "name": "gymId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck36",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminListBrand": {
      "path": "/admin/brands",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck87",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminCreateBrand": {
      "path": "/admin/brands",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck28",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck27",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminGetBrand": {
      "path": "/admin/brands/{brandId}",
      "method": "get",
      "parameters": [
        {
          "name": "brandId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck27",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminEditBrand": {
      "path": "/admin/brands/{brandId}",
      "method": "put",
      "parameters": [
        {
          "name": "brandId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck28",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck27",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminListGym": {
      "path": "/admin/gyms",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck86",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminCreateGym": {
      "path": "/admin/gyms",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck35",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck32",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminGetGym": {
      "path": "/admin/gyms/{gymId}",
      "method": "get",
      "parameters": [
        {
          "name": "gymId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck32",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminEditGym": {
      "path": "/admin/gyms/{gymId}",
      "method": "put",
      "parameters": [
        {
          "name": "gymId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck33",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck32",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminListSettings": {
      "path": "/admin/gyms/{gymId}/settings",
      "method": "get",
      "parameters": [
        {
          "name": "gymId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck88",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminCreateSetting": {
      "path": "/admin/gyms/{gymId}/settings",
      "method": "post",
      "parameters": [
        {
          "name": "gymId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck31",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck30",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminEditSetting": {
      "path": "/admin/gyms/{gymId}/settings/{settingId}",
      "method": "put",
      "parameters": [
        {
          "name": "gymId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "settingId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck31",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck30",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminCancelSetting": {
      "path": "/admin/gyms/{gymId}/settings/{settingId}",
      "method": "delete",
      "parameters": [
        {
          "name": "gymId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "settingId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck30",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "listSchedules": {
      "path": "/crews/{crewId}/schedules",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "participation",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "enum": [
              "all",
              "mine"
            ]
          },
          "validator": "contractCheck141"
        },
        {
          "name": "sort",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "enum": [
              "upcoming",
              "recent"
            ]
          },
          "validator": "contractCheck142"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck89",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "createSchedule": {
      "path": "/crews/{crewId}/schedules",
      "method": "post",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck38",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck37",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "scheduleCalendar": {
      "path": "/crews/{crewId}/schedules/calendar",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "month",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^[0-9]{4}-[0-9]{2}$"
          },
          "validator": "contractCheck143"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "participation",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "enum": [
              "all",
              "mine"
            ]
          },
          "validator": "contractCheck141"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck61",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "getSchedule": {
      "path": "/crews/{crewId}/schedules/{scheduleId}",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "scheduleId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck41",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "editSchedule": {
      "path": "/crews/{crewId}/schedules/{scheduleId}",
      "method": "put",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "scheduleId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck38",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck37",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "cancelSchedule": {
      "path": "/crews/{crewId}/schedules/{scheduleId}/cancellation",
      "method": "post",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "scheduleId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck37",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "respondToSchedule": {
      "path": "/crews/{crewId}/schedules/{scheduleId}/my-response",
      "method": "put",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "scheduleId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck39",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck37",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "recommendGyms": {
      "path": "/crews/{crewId}/schedules/{scheduleId}/recommendations",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "scheduleId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "q",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck70",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "myRecords": {
      "path": "/me/records",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck90",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "createPersonalRecord": {
      "path": "/me/records",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck45",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck49",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "myRecord": {
      "path": "/me/records/{recordId}",
      "method": "get",
      "parameters": [
        {
          "name": "recordId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck49",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "editPersonalRecord": {
      "path": "/me/records/{recordId}",
      "method": "patch",
      "parameters": [
        {
          "name": "recordId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck46",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck49",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "deletePersonalRecord": {
      "path": "/me/records/{recordId}",
      "method": "delete",
      "parameters": [
        {
          "name": "recordId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck3",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "createCrewVisit": {
      "path": "/crews/{crewId}/visits",
      "method": "post",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck55",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck54",
            "binary": false
          }
        },
        "201": {
          "application/json": {
            "validator": "contractCheck54",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "crewVisit": {
      "path": "/crews/{crewId}/visits/{visitId}",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck54",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "editCrewVisit": {
      "path": "/crews/{crewId}/visits/{visitId}",
      "method": "patch",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck56",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck54",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "deleteCrewVisit": {
      "path": "/crews/{crewId}/visits/{visitId}",
      "method": "delete",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck3",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "recordCandidates": {
      "path": "/crews/{crewId}/visits/{visitId}/my-record-candidates",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck91",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "createLinkedRecord": {
      "path": "/crews/{crewId}/visits/{visitId}/my-record",
      "method": "post",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck45",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck58",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "linkExistingRecord": {
      "path": "/crews/{crewId}/visits/{visitId}/my-record",
      "method": "put",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck57",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck58",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "unlinkRecord": {
      "path": "/crews/{crewId}/visits/{visitId}/my-record",
      "method": "delete",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck58",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "browseRecords": {
      "path": "/me/record-browser",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "view",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "enum": [
              "all",
              "personal",
              "crew"
            ]
          },
          "validator": "contractCheck144"
        },
        {
          "name": "crewId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "attendeeAccountIds",
          "in": "query",
          "required": false,
          "style": "form",
          "explode": false,
          "schema": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "uniqueItems": true
          },
          "validator": "contractCheck145"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck92",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "recordCalendar": {
      "path": "/me/record-browser/calendar",
      "method": "get",
      "parameters": [
        {
          "name": "month",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^[0-9]{4}-[0-9]{2}$"
          },
          "validator": "contractCheck143"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "view",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "enum": [
              "all",
              "personal",
              "crew"
            ]
          },
          "validator": "contractCheck144"
        },
        {
          "name": "crewId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "attendeeAccountIds",
          "in": "query",
          "required": false,
          "style": "form",
          "explode": false,
          "schema": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "uniqueItems": true
          },
          "validator": "contractCheck145"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck60",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "myStatistics": {
      "path": "/me/statistics",
      "method": "get",
      "parameters": [
        {
          "name": "period",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "enum": [
              "last_n_days",
              "month",
              "year",
              "all",
              "custom"
            ]
          },
          "validator": "contractCheck146"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "days",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1
          },
          "validator": "contractCheck147"
        },
        {
          "name": "month",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "pattern": "^[0-9]{4}-[0-9]{2}$"
          },
          "validator": "contractCheck143"
        },
        {
          "name": "year",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer"
          },
          "validator": "contractCheck148"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck68",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "memberRecords": {
      "path": "/crews/{crewId}/members/{accountId}/records",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "accountId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck93",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "memberRecord": {
      "path": "/crews/{crewId}/members/{accountId}/records/{recordId}",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "accountId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "recordId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck51",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "memberStatistics": {
      "path": "/crews/{crewId}/members/{accountId}/statistics",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "accountId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "period",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "enum": [
              "last_n_days",
              "month",
              "year",
              "all",
              "custom"
            ]
          },
          "validator": "contractCheck146"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        },
        {
          "name": "days",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1
          },
          "validator": "contractCheck147"
        },
        {
          "name": "month",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "pattern": "^[0-9]{4}-[0-9]{2}$"
          },
          "validator": "contractCheck143"
        },
        {
          "name": "year",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer"
          },
          "validator": "contractCheck148"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck139"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck68",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "historySchedules": {
      "path": "/crews/{crewId}/schedules/{scheduleId}/history",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "scheduleId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck94",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "revertSchedules": {
      "path": "/crews/{crewId}/schedules/{scheduleId}/history/{eventId}/reversion",
      "method": "post",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "scheduleId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "eventId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck2",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "historyVisits": {
      "path": "/crews/{crewId}/visits/{visitId}/history",
      "method": "get",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck94",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "revertVisits": {
      "path": "/crews/{crewId}/visits/{visitId}/history/{eventId}/reversion",
      "method": "post",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "eventId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck2",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "notificationSettings": {
      "path": "/me/notification-settings",
      "method": "get",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck73",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "editNotificationSettings": {
      "path": "/me/notification-settings",
      "method": "patch",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck74",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck73",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "registerDevice": {
      "path": "/me/devices/{deviceId}",
      "method": "put",
      "parameters": [
        {
          "name": "deviceId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck75",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck76",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "unregisterDevice": {
      "path": "/me/devices/{deviceId}",
      "method": "delete",
      "parameters": [
        {
          "name": "deviceId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck4",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "finishWorkout": {
      "path": "/me/workouts/{clientWorkoutId}/finish",
      "method": "post",
      "parameters": [
        {
          "name": "clientWorkoutId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck83",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck49",
            "binary": false
          }
        },
        "201": {
          "application/json": {
            "validator": "contractCheck49",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "appAnnouncements": {
      "path": "/announcements",
      "method": "get",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck97",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminAnnouncements": {
      "path": "/admin/announcements",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck96",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminCreateAnnouncement": {
      "path": "/admin/announcements",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck78",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck77",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminAnnouncement": {
      "path": "/admin/announcements/{announcementId}",
      "method": "get",
      "parameters": [
        {
          "name": "announcementId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck77",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminEditAnnouncement": {
      "path": "/admin/announcements/{announcementId}",
      "method": "put",
      "parameters": [
        {
          "name": "announcementId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck78",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck77",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "adminDeleteAnnouncement": {
      "path": "/admin/announcements/{announcementId}",
      "method": "delete",
      "parameters": [
        {
          "name": "announcementId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck3",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "createProfileImageDraft": {
      "path": "/me/image-drafts",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck104",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck80",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "createAdminImageDraft": {
      "path": "/admin/image-drafts",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck105",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck80",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "myMediaLibrary": {
      "path": "/me/media",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "kind",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "enum": [
              "all",
              "image",
              "video"
            ]
          },
          "validator": "contractCheck149"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck95",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "startMedia": {
      "path": "/media",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck81",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck82",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "mediaInfo": {
      "path": "/media/{fileId}",
      "method": "get",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck48",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "deleteMedia": {
      "path": "/media/{fileId}",
      "method": "delete",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck3",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "retryMedia": {
      "path": "/media/{fileId}/retry",
      "method": "post",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck82",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "completeMedia": {
      "path": "/media/{fileId}/complete",
      "method": "post",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck48",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "uploadHead": {
      "path": "/uploads/{uploadId}",
      "method": "head",
      "parameters": [
        {
          "name": "uploadId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck150"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {},
        "default": {}
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135",
          "Upload-Offset": "contractCheck151",
          "Upload-Length": "contractCheck151",
          "Tus-Resumable": "contractCheck150",
          "Cache-Control": "contractCheck152",
          "X-Error-Code": "contractCheck153",
          "X-Retryable": "contractCheck154"
        },
        "default": {
          "Cache-Control": "contractCheck152",
          "Tus-Resumable": "contractCheck150",
          "X-Error-Code": "contractCheck153",
          "X-Retryable": "contractCheck154"
        }
      }
    },
    "uploadPatch": {
      "path": "/uploads/{uploadId}",
      "method": "patch",
      "parameters": [
        {
          "name": "uploadId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck150"
        },
        {
          "name": "Upload-Offset",
          "in": "header",
          "required": true,
          "schema": {
            "type": "integer",
            "minimum": 0
          },
          "validator": "contractCheck151"
        },
        {
          "name": "Upload-Checksum",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/offset+octet-stream": {
          "validator": "contractCheck155",
          "binary": true
        }
      },
      "responses": {
        "204": {},
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "204": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135",
          "Upload-Offset": "contractCheck151",
          "Upload-Length": "contractCheck151",
          "Tus-Resumable": "contractCheck150"
        },
        "default": {
          "Tus-Resumable": "contractCheck150"
        }
      }
    },
    "uploadDelete": {
      "path": "/uploads/{uploadId}",
      "method": "delete",
      "parameters": [
        {
          "name": "uploadId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck150"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "204": {},
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "204": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135",
          "Upload-Offset": "contractCheck151",
          "Upload-Length": "contractCheck151",
          "Tus-Resumable": "contractCheck150"
        },
        "default": {
          "Tus-Resumable": "contractCheck150"
        }
      }
    },
    "readThumbnail": {
      "path": "/media/{fileId}/thumbnail",
      "method": "get",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "206": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "default": {}
      }
    },
    "readContent": {
      "path": "/media/{fileId}/content",
      "method": "get",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "206": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "default": {}
      }
    },
    "startMediaAdmin": {
      "path": "/admin/media",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck81",
          "binary": false
        }
      },
      "responses": {
        "201": {
          "application/json": {
            "validator": "contractCheck82",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "201": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "mediaInfoAdmin": {
      "path": "/admin/media/{fileId}",
      "method": "get",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck48",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "deleteMediaAdmin": {
      "path": "/admin/media/{fileId}",
      "method": "delete",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck3",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "retryMediaAdmin": {
      "path": "/admin/media/{fileId}/retry",
      "method": "post",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck82",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "completeMediaAdmin": {
      "path": "/admin/media/{fileId}/complete",
      "method": "post",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck48",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "uploadHeadAdmin": {
      "path": "/admin/uploads/{uploadId}",
      "method": "head",
      "parameters": [
        {
          "name": "uploadId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck150"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {},
        "default": {}
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135",
          "Upload-Offset": "contractCheck151",
          "Upload-Length": "contractCheck151",
          "Tus-Resumable": "contractCheck150",
          "Cache-Control": "contractCheck152",
          "X-Error-Code": "contractCheck153",
          "X-Retryable": "contractCheck154"
        },
        "default": {
          "Cache-Control": "contractCheck152",
          "Tus-Resumable": "contractCheck150",
          "X-Error-Code": "contractCheck153",
          "X-Retryable": "contractCheck154"
        }
      }
    },
    "uploadPatchAdmin": {
      "path": "/admin/uploads/{uploadId}",
      "method": "patch",
      "parameters": [
        {
          "name": "uploadId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck150"
        },
        {
          "name": "Upload-Offset",
          "in": "header",
          "required": true,
          "schema": {
            "type": "integer",
            "minimum": 0
          },
          "validator": "contractCheck151"
        },
        {
          "name": "Upload-Checksum",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/offset+octet-stream": {
          "validator": "contractCheck155",
          "binary": true
        }
      },
      "responses": {
        "204": {},
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "204": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135",
          "Upload-Offset": "contractCheck151",
          "Upload-Length": "contractCheck151",
          "Tus-Resumable": "contractCheck150"
        },
        "default": {
          "Tus-Resumable": "contractCheck150"
        }
      }
    },
    "uploadDeleteAdmin": {
      "path": "/admin/uploads/{uploadId}",
      "method": "delete",
      "parameters": [
        {
          "name": "uploadId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck150"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "204": {},
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "204": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135",
          "Upload-Offset": "contractCheck151",
          "Upload-Length": "contractCheck151",
          "Tus-Resumable": "contractCheck150"
        },
        "default": {
          "Tus-Resumable": "contractCheck150"
        }
      }
    },
    "readThumbnailAdmin": {
      "path": "/admin/media/{fileId}/thumbnail",
      "method": "get",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "206": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "default": {}
      }
    },
    "readContentAdmin": {
      "path": "/admin/media/{fileId}/content",
      "method": "get",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "206": {
          "Content-Type": "contractCheck135",
          "Content-Length": "contractCheck151",
          "Accept-Ranges": "contractCheck156",
          "Content-Range": "contractCheck135"
        },
        "default": {}
      }
    },
    "readAnnouncementImage": {
      "path": "/announcement-images/{fileId}",
      "method": "get",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "image/*": {
            "validator": "contractCheck155",
            "binary": true
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {},
        "default": {}
      }
    },
    "unshareDirectCrewMedia": {
      "path": "/crews/{crewId}/visits/{visitId}/media/{fileId}/share",
      "method": "delete",
      "parameters": [
        {
          "name": "crewId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "visitId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck136"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck2",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "reuploadMedia": {
      "path": "/media/{fileId}/reupload",
      "method": "post",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck82",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "uploadOptions": {
      "path": "/uploads",
      "method": "options",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "204": {},
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "204": {
          "Tus-Version": "contractCheck150",
          "Tus-Extension": "contractCheck157",
          "Tus-Checksum-Algorithm": "contractCheck158"
        },
        "default": {}
      }
    },
    "reuploadMediaAdmin": {
      "path": "/admin/media/{fileId}/reupload",
      "method": "post",
      "parameters": [
        {
          "name": "fileId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "description": "안정적인 UUID 식별자",
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck82",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134",
          "ETag": "contractCheck135"
        },
        "default": {}
      }
    },
    "uploadOptionsAdmin": {
      "path": "/admin/uploads",
      "method": "options",
      "parameters": [],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "204": {},
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "204": {
          "Tus-Version": "contractCheck150",
          "Tus-Extension": "contractCheck157",
          "Tus-Checksum-Algorithm": "contractCheck158"
        },
        "default": {}
      }
    },
    "myNotifications": {
      "path": "/me/notifications",
      "method": "get",
      "parameters": [
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "pageSize",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 200,
            "default": 50
          },
          "validator": "contractCheck137"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck140"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck108",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134"
        },
        "default": {}
      }
    },
    "markNotificationRead": {
      "path": "/me/notifications/{notificationId}/read",
      "method": "post",
      "parameters": [
        {
          "name": "notificationId",
          "in": "path",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck109",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck110",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134"
        },
        "default": {}
      }
    },
    "readAllNotifications": {
      "path": "/me/notifications/read-all",
      "method": "post",
      "parameters": [
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck134"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/json": {
          "validator": "contractCheck109",
          "binary": false
        }
      },
      "responses": {
        "200": {
          "application/json": {
            "validator": "contractCheck111",
            "binary": false
          }
        },
        "default": {
          "application/json": {
            "validator": "contractCheck1",
            "binary": false
          }
        }
      },
      "responseHeaders": {
        "200": {
          "X-Request-Id": "contractCheck134"
        },
        "default": {}
      }
    }
  }
};
