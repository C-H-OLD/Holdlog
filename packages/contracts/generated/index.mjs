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
    "AttendanceSelection": "contractCheck106"
  },
  "runtime": {
    "ClimbCount": "contractCheck107",
    "WorkoutDraft": "contractCheck108",
    "WorkoutLifecycle": "contractCheck109",
    "WorkoutDisplay": "contractCheck110",
    "AnnouncementSuppression": "contractCheck111",
    "PendingInvite": "contractCheck112",
    "Route": "contractCheck113",
    "PushPayload": "contractCheck114",
    "NoticeEntry": "contractCheck115",
    "OpenSourceManifest": "contractCheck116",
    "MediaJob": "contractCheck117",
    "NotificationJob": "contractCheck118",
    "DomainEvent": "contractCheck119",
    "StorageObjectRef": "contractCheck120",
    "StorageStart": "contractCheck121",
    "StorageAppend": "contractCheck122",
    "StorageComplete": "contractCheck123",
    "StorageCancel": "contractCheck124",
    "StorageRead": "contractCheck125",
    "StorageStat": "contractCheck126",
    "StorageDelete": "contractCheck127",
    "StorageResult": "contractCheck128"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
        },
        {
          "name": "q",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
        },
        {
          "name": "q",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        },
        {
          "name": "brandId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "bounds",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "description": "west,south,east,north. 경도/위도 범위; 날짜선 횡단 허용"
          },
          "validator": "contractCheck133"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
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
          "validator": "contractCheck136"
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
          "validator": "contractCheck137"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "month",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^[0-9]{4}-[0-9]{2}$"
          },
          "validator": "contractCheck138"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
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
          "validator": "contractCheck136"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
        },
        {
          "name": "q",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
        },
        "201": {
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
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
          "validator": "contractCheck139"
        },
        {
          "name": "crewId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "validator": "contractCheck140"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck138"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
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
          "validator": "contractCheck139"
        },
        {
          "name": "crewId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "validator": "contractCheck140"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck141"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "days",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1
          },
          "validator": "contractCheck142"
        },
        {
          "name": "month",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "pattern": "^[0-9]{4}-[0-9]{2}$"
          },
          "validator": "contractCheck138"
        },
        {
          "name": "year",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer"
          },
          "validator": "contractCheck143"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "gymId",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck141"
        },
        {
          "name": "timeZone",
          "in": "query",
          "required": true,
          "schema": {
            "type": "string",
            "format": "iana-time-zone"
          },
          "validator": "contractCheck135"
        },
        {
          "name": "days",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer",
            "minimum": 1
          },
          "validator": "contractCheck142"
        },
        {
          "name": "month",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "pattern": "^[0-9]{4}-[0-9]{2}$"
          },
          "validator": "contractCheck138"
        },
        {
          "name": "year",
          "in": "query",
          "required": false,
          "schema": {
            "type": "integer"
          },
          "validator": "contractCheck143"
        },
        {
          "name": "startDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
        },
        {
          "name": "endDate",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "validator": "contractCheck134"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "cursor",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
        },
        "201": {
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck130"
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
          "validator": "contractCheck132"
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
          "validator": "contractCheck144"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck145"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130",
          "Upload-Offset": "contractCheck146",
          "Upload-Length": "contractCheck146",
          "Tus-Resumable": "contractCheck145",
          "Cache-Control": "contractCheck147",
          "X-Error-Code": "contractCheck148",
          "X-Retryable": "contractCheck149"
        },
        "default": {
          "Cache-Control": "contractCheck147",
          "Tus-Resumable": "contractCheck145",
          "X-Error-Code": "contractCheck148",
          "X-Retryable": "contractCheck149"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck145"
        },
        {
          "name": "Upload-Offset",
          "in": "header",
          "required": true,
          "schema": {
            "type": "integer",
            "minimum": 0
          },
          "validator": "contractCheck146"
        },
        {
          "name": "Upload-Checksum",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/offset+octet-stream": {
          "validator": "contractCheck150",
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130",
          "Upload-Offset": "contractCheck146",
          "Upload-Length": "contractCheck146",
          "Tus-Resumable": "contractCheck145"
        },
        "default": {
          "Tus-Resumable": "contractCheck145"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck145"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130",
          "Upload-Offset": "contractCheck146",
          "Upload-Length": "contractCheck146",
          "Tus-Resumable": "contractCheck145"
        },
        "default": {
          "Tus-Resumable": "contractCheck145"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck150",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck150",
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
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
        },
        "206": {
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck150",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck150",
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
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
        },
        "206": {
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck145"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130",
          "Upload-Offset": "contractCheck146",
          "Upload-Length": "contractCheck146",
          "Tus-Resumable": "contractCheck145",
          "Cache-Control": "contractCheck147",
          "X-Error-Code": "contractCheck148",
          "X-Retryable": "contractCheck149"
        },
        "default": {
          "Cache-Control": "contractCheck147",
          "Tus-Resumable": "contractCheck145",
          "X-Error-Code": "contractCheck148",
          "X-Retryable": "contractCheck149"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck145"
        },
        {
          "name": "Upload-Offset",
          "in": "header",
          "required": true,
          "schema": {
            "type": "integer",
            "minimum": 0
          },
          "validator": "contractCheck146"
        },
        {
          "name": "Upload-Checksum",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        }
      ],
      "bodyRequired": true,
      "body": {
        "application/offset+octet-stream": {
          "validator": "contractCheck150",
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130",
          "Upload-Offset": "contractCheck146",
          "Upload-Length": "contractCheck146",
          "Tus-Resumable": "contractCheck145"
        },
        "default": {
          "Tus-Resumable": "contractCheck145"
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
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        },
        {
          "name": "Tus-Resumable",
          "in": "header",
          "required": true,
          "schema": {
            "const": "1.0.0"
          },
          "validator": "contractCheck145"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130",
          "Upload-Offset": "contractCheck146",
          "Upload-Length": "contractCheck146",
          "Tus-Resumable": "contractCheck145"
        },
        "default": {
          "Tus-Resumable": "contractCheck145"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck150",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck150",
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
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
        },
        "206": {
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Range",
          "in": "header",
          "required": false,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "application/octet-stream": {
            "validator": "contractCheck150",
            "binary": true
          }
        },
        "206": {
          "application/octet-stream": {
            "validator": "contractCheck150",
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
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
        },
        "206": {
          "Content-Type": "contractCheck130",
          "Content-Length": "contractCheck146",
          "Accept-Ranges": "contractCheck151",
          "Content-Range": "contractCheck130"
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
          "validator": "contractCheck129"
        }
      ],
      "bodyRequired": false,
      "body": {},
      "responses": {
        "200": {
          "image/*": {
            "validator": "contractCheck150",
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "If-Match",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "pattern": "^\"[1-9][0-9]*\"$"
          },
          "validator": "contractCheck131"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "Tus-Version": "contractCheck145",
          "Tus-Extension": "contractCheck152",
          "Tus-Checksum-Algorithm": "contractCheck153"
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
          "validator": "contractCheck129"
        },
        {
          "name": "Idempotency-Key",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          },
          "validator": "contractCheck129"
        },
        {
          "name": "X-CSRF-Token",
          "in": "header",
          "required": true,
          "schema": {
            "type": "string"
          },
          "validator": "contractCheck130"
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
          "X-Request-Id": "contractCheck129",
          "ETag": "contractCheck130"
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
          "Tus-Version": "contractCheck145",
          "Tus-Extension": "contractCheck152",
          "Tus-Checksum-Algorithm": "contractCheck153"
        },
        "default": {}
      }
    }
  }
};
