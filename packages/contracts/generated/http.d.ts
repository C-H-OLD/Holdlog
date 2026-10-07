export interface paths {
    "/auth/challenges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** createLoginChallenge */
        post: operations["createLoginChallenge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** login */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/sessions/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** refreshSession */
        post: operations["refreshSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/sessions/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** logout */
        delete: operations["logout"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/auth/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** adminLogin */
        post: operations["adminLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/auth/sessions/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminSession */
        get: operations["adminSession"];
        put?: never;
        post?: never;
        /** adminLogout */
        delete: operations["adminLogout"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getMyProfile */
        get: operations["getMyProfile"];
        put?: never;
        post?: never;
        /** deleteAccount */
        delete: operations["deleteAccount"];
        options?: never;
        head?: never;
        /** editMyProfile */
        patch: operations["editMyProfile"];
        trace?: never;
    };
    "/me/selected-crew": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getSelectedCrew */
        get: operations["getSelectedCrew"];
        /** selectCrew */
        put: operations["selectCrew"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/crews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** myCrews */
        get: operations["myCrews"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** createCrew */
        post: operations["createCrew"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getCrew */
        get: operations["getCrew"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** crewMembers */
        get: operations["crewMembers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invites/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** resolveInvite */
        post: operations["resolveInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/join": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** joinCrew */
        post: operations["joinCrew"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getCrewInvite */
        get: operations["getCrewInvite"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/administrator": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** transferAdministrator */
        put: operations["transferAdministrator"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/account-deletion-preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** previewAccountDeletion */
        get: operations["previewAccountDeletion"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/leave-preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** previewLeaveCrew */
        get: operations["previewLeaveCrew"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/my-membership": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** leaveCrew */
        delete: operations["leaveCrew"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/brands": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listBrands */
        get: operations["listBrands"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/gyms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** searchGyms */
        get: operations["searchGyms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/gyms/{gymId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** gymDetail */
        get: operations["gymDetail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/brands": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminListBrand */
        get: operations["adminListBrand"];
        put?: never;
        /** adminCreateBrand */
        post: operations["adminCreateBrand"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/brands/{brandId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminGetBrand */
        get: operations["adminGetBrand"];
        /** adminEditBrand */
        put: operations["adminEditBrand"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/gyms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminListGym */
        get: operations["adminListGym"];
        put?: never;
        /** adminCreateGym */
        post: operations["adminCreateGym"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/gyms/{gymId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminGetGym */
        get: operations["adminGetGym"];
        /** adminEditGym */
        put: operations["adminEditGym"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/gyms/{gymId}/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminListSettings */
        get: operations["adminListSettings"];
        put?: never;
        /** adminCreateSetting */
        post: operations["adminCreateSetting"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/gyms/{gymId}/settings/{settingId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** adminEditSetting */
        put: operations["adminEditSetting"];
        post?: never;
        /** adminCancelSetting */
        delete: operations["adminCancelSetting"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** listSchedules */
        get: operations["listSchedules"];
        put?: never;
        /** createSchedule */
        post: operations["createSchedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules/calendar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** scheduleCalendar */
        get: operations["scheduleCalendar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules/{scheduleId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** getSchedule */
        get: operations["getSchedule"];
        /** editSchedule */
        put: operations["editSchedule"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules/{scheduleId}/cancellation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** cancelSchedule */
        post: operations["cancelSchedule"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules/{scheduleId}/my-response": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** respondToSchedule */
        put: operations["respondToSchedule"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules/{scheduleId}/recommendations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** recommendGyms */
        get: operations["recommendGyms"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** myRecords */
        get: operations["myRecords"];
        put?: never;
        /** createPersonalRecord */
        post: operations["createPersonalRecord"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/records/{recordId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** myRecord */
        get: operations["myRecord"];
        put?: never;
        post?: never;
        /** deletePersonalRecord */
        delete: operations["deletePersonalRecord"];
        options?: never;
        head?: never;
        /** editPersonalRecord */
        patch: operations["editPersonalRecord"];
        trace?: never;
    };
    "/crews/{crewId}/visits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** createCrewVisit */
        post: operations["createCrewVisit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/visits/{visitId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** crewVisit */
        get: operations["crewVisit"];
        put?: never;
        post?: never;
        /** deleteCrewVisit */
        delete: operations["deleteCrewVisit"];
        options?: never;
        head?: never;
        /** editCrewVisit */
        patch: operations["editCrewVisit"];
        trace?: never;
    };
    "/crews/{crewId}/visits/{visitId}/my-record-candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** recordCandidates */
        get: operations["recordCandidates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/visits/{visitId}/my-record": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** linkExistingRecord */
        put: operations["linkExistingRecord"];
        /** createLinkedRecord */
        post: operations["createLinkedRecord"];
        /** unlinkRecord */
        delete: operations["unlinkRecord"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/record-browser": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** browseRecords */
        get: operations["browseRecords"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/record-browser/calendar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** recordCalendar */
        get: operations["recordCalendar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** myStatistics */
        get: operations["myStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/members/{accountId}/records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** memberRecords */
        get: operations["memberRecords"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/members/{accountId}/records/{recordId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** memberRecord */
        get: operations["memberRecord"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/members/{accountId}/statistics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** memberStatistics */
        get: operations["memberStatistics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules/{scheduleId}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** historySchedules */
        get: operations["historySchedules"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/schedules/{scheduleId}/history/{eventId}/reversion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** revertSchedules */
        post: operations["revertSchedules"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/visits/{visitId}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** historyVisits */
        get: operations["historyVisits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/visits/{visitId}/history/{eventId}/reversion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** revertVisits */
        post: operations["revertVisits"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/notification-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** notificationSettings */
        get: operations["notificationSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** editNotificationSettings */
        patch: operations["editNotificationSettings"];
        trace?: never;
    };
    "/me/devices/{deviceId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** registerDevice */
        put: operations["registerDevice"];
        post?: never;
        /** unregisterDevice */
        delete: operations["unregisterDevice"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/workouts/{clientWorkoutId}/finish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** finishWorkout */
        post: operations["finishWorkout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/announcements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** appAnnouncements */
        get: operations["appAnnouncements"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/announcements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminAnnouncements */
        get: operations["adminAnnouncements"];
        put?: never;
        /** adminCreateAnnouncement */
        post: operations["adminCreateAnnouncement"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/announcements/{announcementId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** adminAnnouncement */
        get: operations["adminAnnouncement"];
        /** adminEditAnnouncement */
        put: operations["adminEditAnnouncement"];
        post?: never;
        /** adminDeleteAnnouncement */
        delete: operations["adminDeleteAnnouncement"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/image-drafts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** createProfileImageDraft */
        post: operations["createProfileImageDraft"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/image-drafts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** createAdminImageDraft */
        post: operations["createAdminImageDraft"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** myMediaLibrary */
        get: operations["myMediaLibrary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** startMedia */
        post: operations["startMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** mediaInfo */
        get: operations["mediaInfo"];
        put?: never;
        post?: never;
        /** deleteMedia */
        delete: operations["deleteMedia"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media/{fileId}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** retryMedia */
        post: operations["retryMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media/{fileId}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** completeMedia */
        post: operations["completeMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/uploads/{uploadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** uploadDelete */
        delete: operations["uploadDelete"];
        options?: never;
        /** uploadHead */
        head: operations["uploadHead"];
        /** uploadPatch */
        patch: operations["uploadPatch"];
        trace?: never;
    };
    "/media/{fileId}/thumbnail": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** readThumbnail */
        get: operations["readThumbnail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media/{fileId}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** readContent */
        get: operations["readContent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** startMediaAdmin */
        post: operations["startMediaAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/media/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** mediaInfoAdmin */
        get: operations["mediaInfoAdmin"];
        put?: never;
        post?: never;
        /** deleteMediaAdmin */
        delete: operations["deleteMediaAdmin"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/media/{fileId}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** retryMediaAdmin */
        post: operations["retryMediaAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/media/{fileId}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** completeMediaAdmin */
        post: operations["completeMediaAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/uploads/{uploadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** uploadDeleteAdmin */
        delete: operations["uploadDeleteAdmin"];
        options?: never;
        /** uploadHeadAdmin */
        head: operations["uploadHeadAdmin"];
        /** uploadPatchAdmin */
        patch: operations["uploadPatchAdmin"];
        trace?: never;
    };
    "/admin/media/{fileId}/thumbnail": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** readThumbnailAdmin */
        get: operations["readThumbnailAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/media/{fileId}/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** readContentAdmin */
        get: operations["readContentAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/announcement-images/{fileId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** readAnnouncementImage */
        get: operations["readAnnouncementImage"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/crews/{crewId}/visits/{visitId}/media/{fileId}/share": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** unshareDirectCrewMedia */
        delete: operations["unshareDirectCrewMedia"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media/{fileId}/reupload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** reuploadMedia */
        post: operations["reuploadMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        /** uploadOptions */
        options: operations["uploadOptions"];
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/media/{fileId}/reupload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** reuploadMediaAdmin */
        post: operations["reuploadMediaAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        /** uploadOptionsAdmin */
        options: operations["uploadOptionsAdmin"];
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        FieldError: {
            path: string;
            code: string;
        };
        Error: {
            /** @enum {string} */
            code: "INVALID_INPUT" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VERSION_CONFLICT" | "PRECONDITION_REQUIRED" | "IDEMPOTENCY_MISMATCH" | "REQUEST_IN_PROGRESS" | "ALREADY_MEMBER" | "INVITE_INVALID" | "JOIN_BLOCKED" | "LINK_CONFLICT" | "LINKED_VISIT_LOCKED" | "DATE_GYM_MISMATCH" | "NOT_ATTENDEE" | "ACTIVE_RECORD_ELSEWHERE" | "ADMIN_TRANSFER_INVALID" | "ADMIN_TRANSFER_REQUIRED" | "ACCOUNT_DELETED" | "UPLOAD_OFFSET_CONFLICT" | "CHECKSUM_MISMATCH" | "UNSUPPORTED_MEDIA" | "MEDIA_NOT_READY" | "REUPLOAD_REQUIRED" | "RANGE_NOT_SATISFIABLE" | "TEMPORARY_FAILURE" | "QUERY_SNAPSHOT_CHANGED" | "TIME_REQUIRED" | "ACTUAL_VISIT_IN_FUTURE" | "WORKOUT_RESULT_DELETED";
            /** Format: uuid */
            requestId: string;
            fieldErrors: components["schemas"]["FieldError"][];
            currentVersion: number | null;
            resourceId: string | null;
            retryable: boolean;
            blockingCrewIds: string[];
            existingVisitId: string | null;
        };
        MutationResult: {
            /** Format: uuid */
            id: string;
            version: number;
        };
        DeleteResult: {
            /** Format: uuid */
            id: string;
            /** @constant */
            deleted: true;
            cleanupPending: boolean;
        };
        EmptyResult: Record<string, never>;
        VersionInput: {
            version: number;
        };
        Profile: {
            /** Format: uuid */
            id: string;
            name: string;
            photoFileId: string | null;
            version: number;
            identity: {
                /** @enum {string} */
                provider: "google" | "apple";
                /** Format: email */
                email: string | null;
            };
        };
        ProfileInput: {
            name?: string;
            photoFileId?: string | null;
        };
        LoginChallenge: {
            /** Format: uuid */
            challengeId: string;
            nonce: string;
            /** Format: date-time */
            expiresAt: string;
        };
        LoginInput: {
            /** @enum {string} */
            provider: "google" | "apple";
            idToken: string;
            /** Format: uuid */
            challengeId: string;
            /** Format: uuid */
            deviceId: string;
            authorizationCode: string | null;
        };
        MobileSession: {
            accessToken: string;
            /** Format: date-time */
            accessExpiresAt: string;
            refreshToken: string;
            /** Format: date-time */
            refreshExpiresAt: string;
            profile: components["schemas"]["Profile"];
        };
        RefreshInput: {
            refreshToken: string;
            /** Format: uuid */
            deviceId: string;
        };
        AdminLoginInput: {
            loginId: string;
            password: string;
        };
        AdminSession: {
            /** Format: uuid */
            principalId: string;
            csrfToken: string;
            /** Format: date-time */
            expiresAt: string;
        };
        SelectedCrew: {
            crewId: string | null;
            version: number;
        };
        SelectedCrewInput: {
            crewId: string | null;
        };
        Crew: {
            /** Format: uuid */
            id: string;
            name: string;
            memberCount: number;
            /** @enum {string} */
            myRole: "admin" | "member";
            version: number;
        };
        CrewInput: {
            name: string;
        };
        Member: {
            /** Format: uuid */
            accountId: string;
            name: string;
            photoFileId: string | null;
            /** @enum {string} */
            role: "admin" | "member";
        };
        InvitePreview: {
            /** Format: uuid */
            inviteId: string;
            crewName: string;
            /** @enum {string} */
            membership: "not_joined" | "already_joined";
            crewId: string | null;
        };
        InviteResolveInput: {
            code: string;
        };
        Invite: {
            /** Format: uuid */
            inviteId: string;
            code: string;
            /** Format: uri */
            link: string;
            shareText: string;
        };
        JoinInput: {
            /** Format: uuid */
            inviteId: string;
        };
        TransferInput: {
            /** Format: uuid */
            memberAccountId: string;
        };
        AccountLifecyclePreview: {
            activeCrewCount: number;
            mustTransferCrewIds: string[];
            /** @enum {string} */
            operation: "leave_crew" | "delete_account";
        };
        Grade: {
            /** Format: uuid */
            id: string;
            gradeKey: number;
            name: string;
            color: string;
            order: number;
            retired: boolean;
        };
        GradeInput: {
            id: string | null;
            name: string;
            color: string;
            order: number;
        };
        Brand: {
            /** Format: uuid */
            id: string;
            name: string;
            logoFileId: string | null;
            grades: components["schemas"]["Grade"][];
            version: number;
        };
        BrandInput: {
            name: string;
            logoFileId: string | null;
            grades: components["schemas"]["GradeInput"][];
        };
        Wall: {
            /** Format: uuid */
            id: string;
            name: string;
            order: number;
        };
        Setting: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            gymId: string;
            /** Format: uuid */
            wallId: string;
            /** Format: date */
            localDate: string;
            /** Format: iana-time-zone */
            timeZone: string;
            /** @enum {string} */
            status: "scheduled" | "effective" | "cancelled";
            version: number;
        };
        SettingInput: {
            /** Format: uuid */
            wallId: string;
            /** Format: date */
            localDate: string;
        };
        Gym: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            brandId: string;
            name: string;
            region: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            /** Format: iana-time-zone */
            timeZone: string;
            displayColor: string;
            version: number;
        };
        GymInput: {
            /** Format: uuid */
            brandId: string;
            name: string;
            region: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            /** Format: iana-time-zone */
            timeZone: string;
            displayColor: string;
        };
        NewWall: {
            name: string;
            order: number;
        };
        GymCreateInput: {
            /** Format: uuid */
            brandId: string;
            name: string;
            region: string;
            address: string;
            latitude: number | null;
            longitude: number | null;
            /** Format: iana-time-zone */
            timeZone: string;
            displayColor: string;
            walls: components["schemas"]["NewWall"][];
        };
        GymDetail: {
            gym: components["schemas"]["Gym"];
            brand: components["schemas"]["Brand"];
            walls: components["schemas"]["Wall"][];
            settings: components["schemas"]["Setting"][];
        };
        Schedule: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            crewId: string;
            creatorAccountId: string | null;
            /** Format: date-time */
            scheduledAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            gymId: string | null;
            description: string | null;
            /** @enum {string} */
            status: "planned" | "ended" | "cancelled";
            hasEverCreatedVisit: boolean;
            activeVisitId: string | null;
            /** @enum {string} */
            myResponse: "unanswered" | "participating" | "declined";
            participatingCount: number;
            declinedCount: number;
            unansweredCount: number;
            canEdit: boolean;
            canRespond: boolean;
            version: number;
            creator: components["schemas"]["Actor"];
        };
        ScheduleInput: {
            /** Format: date-time */
            scheduledAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            gymId: string | null;
            description: string | null;
        };
        ResponseInput: {
            /** @enum {string} */
            response: "participating" | "declined";
        };
        ScheduleMemberResponse: {
            member: components["schemas"]["Member"];
            /** @enum {string} */
            response: "unanswered" | "participating" | "declined";
        };
        ScheduleDetail: {
            schedule: components["schemas"]["Schedule"];
            members: components["schemas"]["ScheduleMemberResponse"][];
        };
        ClimbCount: {
            /** Format: uuid */
            brandId: string;
            gradeKey: number;
            count: number;
        };
        ClimbDisplay: {
            /** Format: uuid */
            brandId: string;
            gradeKey: number;
            count: number;
            name: string;
            color: string | null;
            order: number;
            retired: boolean;
        };
        AttachmentEdit: {
            /** Format: uuid */
            fileId: string;
            /** @enum {string} */
            visibility: "public" | "private";
        };
        PersonalRecordInput: {
            /** Format: date-time */
            visitedAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            /** Format: uuid */
            gymId: string;
            climbs: components["schemas"]["ClimbCount"][] | null;
            condition: number | null;
            review: string | null;
            /** @enum {string} */
            reviewVisibility: "public" | "private";
        };
        PersonalRecordUpdate: {
            /** Format: date-time */
            visitedAt?: string;
            /** Format: iana-time-zone */
            timeZone?: string;
            /** Format: uuid */
            gymId?: string;
            climbs?: components["schemas"]["ClimbCount"][] | null;
            condition?: number | null;
            review?: string | null;
            /** @enum {string} */
            reviewVisibility?: "public" | "private";
            attachments?: components["schemas"]["AttachmentEdit"][];
        };
        ActiveLink: {
            /** Format: uuid */
            visitId: string;
            /** Format: uuid */
            crewId: string;
            /** Format: uuid */
            attendanceId: string;
            /** Format: iana-time-zone */
            visitTimeZone: string;
            /** Format: date */
            visitLocalDate: string;
        };
        Media: {
            /** Format: uuid */
            id: string;
            ownerAccountId: string | null;
            /** @enum {string} */
            kind: "image" | "video";
            /** @enum {string} */
            purpose: "personal_attachment" | "crew_direct" | "profile" | "brand_logo" | "announcement";
            /** @enum {string} */
            state: "uploading" | "processing" | "ready" | "failed" | "reupload_required";
            visibility: ("public" | "private") | null;
            personalRecordId: string | null;
            isShared: boolean;
            version: number;
            uploadOffset: number | null;
            uploadId: string | null;
            failureCode: string | null;
            retryMode: ("resume" | "reprocess" | "reupload") | null;
            mimeType: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        OwnerRecord: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            ownerAccountId: string;
            /** Format: date-time */
            visitedAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            /** Format: uuid */
            gymId: string;
            climbs: components["schemas"]["ClimbCount"][] | null;
            condition: number | null;
            review: string | null;
            /** @enum {string} */
            reviewVisibility: "public" | "private";
            ownerOnly: boolean;
            activeLink: components["schemas"]["ActiveLink"] | null;
            attachments: components["schemas"]["Media"][];
            version: number;
            climbDisplay: components["schemas"]["ClimbDisplay"][] | null;
        };
        PublicMedia: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            kind: "image" | "video";
            /** @enum {string} */
            state: "processing" | "ready";
            /** @enum {string} */
            source: "personal_attachment" | "crew_direct";
            isOwnedByViewer: boolean;
            canUnshare: boolean;
        };
        PublicRecord: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            ownerAccountId: string;
            /** Format: date-time */
            visitedAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            /** Format: uuid */
            gymId: string;
            climbs: components["schemas"]["ClimbDisplay"][] | null;
            condition: number | null;
            review: string | null;
            media: components["schemas"]["PublicMedia"][];
        };
        RecordCandidate: {
            record: components["schemas"]["OwnerRecord"];
            selectable: boolean;
            unavailableReason: "active_record_elsewhere" | null;
            climbTotal: number | null;
        };
        Attendee: {
            /** Format: uuid */
            attendanceId: string;
            member: components["schemas"]["Actor"];
            linkedRecord: components["schemas"]["PublicRecord"] | null;
            isSelf: boolean;
            canLink: boolean;
        };
        CrewVisit: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            crewId: string;
            scheduleId: string | null;
            /** Format: date-time */
            visitedAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            /** Format: uuid */
            gymId: string;
            memo: string | null;
            attendees: components["schemas"]["Attendee"][];
            media: components["schemas"]["PublicMedia"][];
            canEdit: boolean;
            canDelete: boolean;
            version: number;
        };
        VisitInput: {
            scheduleId: string | null;
            /** Format: date-time */
            visitedAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            /** Format: uuid */
            gymId: string;
            memo: string | null;
            attendeeAccountIds: string[];
        };
        VisitUpdate: {
            /** Format: date-time */
            visitedAt?: string;
            /** Format: iana-time-zone */
            timeZone?: string;
            /** Format: uuid */
            gymId?: string;
            memo?: string | null;
            attendance?: components["schemas"]["AttendanceSelection"];
        };
        LinkInput: {
            /** Format: uuid */
            recordId: string;
            recordVersion: number;
        };
        LinkResult: {
            /** Format: uuid */
            visitId: string;
            visitVersion: number;
            /** Format: uuid */
            recordId: string;
            recordVersion: number;
        };
        BrowseRow: {
            /** @enum {string} */
            kind: "personal" | "crew";
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            representativeAt: string;
            /** Format: date */
            localDate: string;
            /** Format: uuid */
            gymId: string;
            personalRecordId: string | null;
            crewVisitId: string | null;
            attendeeCount: number | null;
            climbTotal: number | null;
            condition: number | null;
            myAttendance: boolean;
        };
        RecordCalendar: {
            month: string;
            /** Format: iana-time-zone */
            timeZone: string;
            items: components["schemas"]["BrowseRow"][];
            totalCount: number;
            /** @constant */
            complete: true;
        };
        ScheduleCalendar: {
            month: string;
            /** Format: iana-time-zone */
            timeZone: string;
            items: components["schemas"]["Schedule"][];
            totalCount: number;
            /** @constant */
            complete: true;
        };
        Period: {
            startDate: string | null;
            /** Format: date */
            endDate: string;
            /** Format: date */
            averageEndDate: string;
            /** Format: iana-time-zone */
            timeZone: string;
            daysForAverage: number | null;
        };
        StatsBucket: {
            /** Format: date */
            startDate: string;
            /** Format: date */
            endDate: string;
            partial: boolean;
            visitCount: number;
            workoutDayCount: number;
            climbTotal: number | null;
        };
        GymStats: {
            /** Format: uuid */
            gymId: string;
            visitCount: number;
        };
        GradeStats: {
            /** Format: uuid */
            brandId: string;
            gradeKey: number;
            name: string;
            color: string | null;
            retired: boolean;
            count: number;
        };
        ConditionPoint: {
            /** Format: uuid */
            recordId: string;
            /** Format: date-time */
            visitedAt: string;
            condition: number;
        };
        ConditionBucket: {
            condition: number;
            count: number;
        };
        Statistics: {
            period: components["schemas"]["Period"];
            visitCount: number;
            workoutDayCount: number;
            gymCount: number;
            weeklyVisitAverage: number | null;
            weeklyDayAverage: number | null;
            climbTotal: number | null;
            climbsEnteredVisitCount: number;
            conditionEnteredVisitCount: number;
            daily: components["schemas"]["StatsBucket"][];
            weekly: components["schemas"]["StatsBucket"][];
            monthly: components["schemas"]["StatsBucket"][];
            gyms: components["schemas"]["GymStats"][];
            grades: components["schemas"]["GradeStats"][];
            conditionTrend: components["schemas"]["ConditionPoint"][];
            conditionDistribution: components["schemas"]["ConditionBucket"][];
        };
        RecommendationItem: {
            /** Format: uuid */
            gymId: string;
            newWallRatio: number | null;
            calculatedParticipantCount: number;
            totalWallCount: number;
            uncomputableReason: ("no_participants" | "missing_visit_history" | "missing_walls" | "missing_setting_history") | null;
        };
        Recommendations: {
            /** Format: uuid */
            scheduleId: string;
            scheduleVersion: number;
            participants: components["schemas"]["Member"][];
            items: components["schemas"]["RecommendationItem"][];
            nextCursor: string | null;
            snapshotVersion: string;
            inputRevision: string;
        };
        HistoryChange: components["schemas"]["HistoryTimeChange"] | components["schemas"]["HistoryTextChange"] | components["schemas"]["HistoryIdChange"] | components["schemas"]["HistoryAttendeeChange"];
        HistoryEvent: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            targetKind: "schedule" | "crew_visit";
            /** Format: uuid */
            targetId: string;
            /** @enum {string} */
            operation: "created" | "updated" | "cancelled" | "deleted" | "attendance_changed" | "record_linked" | "record_unlinked" | "file_shared" | "file_unshared" | "reverted" | "record_relinked";
            actor: components["schemas"]["Actor"] | null;
            /** Format: date-time */
            occurredAt: string;
            changes: components["schemas"]["HistoryChange"][];
            canRevert: boolean;
        };
        NotificationSettings: {
            newSchedule: boolean;
            scheduleChanges: boolean;
            recordReminder: boolean;
            version: number;
        };
        NotificationSettingsInput: {
            newSchedule?: boolean;
            scheduleChanges?: boolean;
            recordReminder?: boolean;
        };
        DeviceInput: {
            /** Format: uuid */
            deviceId: string;
            /** @enum {string} */
            platform: "ios" | "android";
            fcmToken: string;
        };
        Device: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            platform: "ios" | "android";
        };
        Announcement: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            imageFileId: string;
            link: string | null;
            order: number;
            version: number;
        };
        AnnouncementInput: {
            /** Format: uuid */
            imageFileId: string;
            link: string | null;
            order: number;
        };
        AssetDraftInput: {
            /** @enum {string} */
            purpose: "profile" | "brand_logo" | "announcement";
        };
        AssetDraft: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            purpose: "profile" | "brand_logo" | "announcement";
        };
        MediaCreateInput: {
            /** @enum {string} */
            purpose: "personal_attachment" | "crew_direct" | "profile" | "brand_logo" | "announcement";
            /** Format: uuid */
            targetId: string;
            filename: string;
            mimeType: string;
            byteLength: number;
            sha256: string;
            /** @enum {string} */
            visibility?: "public" | "private";
        };
        UploadTicket: {
            file: components["schemas"]["Media"];
            /** Format: uuid */
            uploadId: string;
            uploadPath: string;
            offset: number;
            /** Format: date-time */
            expiresAt: string;
        };
        WorkoutFinishInput: {
            /** Format: uuid */
            gymId: string;
            /** Format: date-time */
            startedAt: string;
            /** Format: iana-time-zone */
            timeZone: string;
            climbs: components["schemas"]["ClimbCount"][];
        };
        CrewPage: {
            items: components["schemas"]["Crew"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        MemberPage: {
            items: components["schemas"]["Member"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        GymPage: {
            items: components["schemas"]["Gym"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        BrandPage: {
            items: components["schemas"]["Brand"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        SettingPage: {
            items: components["schemas"]["Setting"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        SchedulePage: {
            items: components["schemas"]["Schedule"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        OwnerRecordPage: {
            items: components["schemas"]["OwnerRecord"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        RecordCandidatePage: {
            items: components["schemas"]["RecordCandidate"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        BrowseRowPage: {
            items: components["schemas"]["BrowseRow"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        PublicRecordPage: {
            items: components["schemas"]["PublicRecord"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        HistoryEventPage: {
            items: components["schemas"]["HistoryEvent"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        MediaPage: {
            items: components["schemas"]["Media"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        AnnouncementPage: {
            items: components["schemas"]["Announcement"][];
            nextCursor: string | null;
            snapshotVersion: string;
        };
        AnnouncementList: {
            items: components["schemas"]["Announcement"][];
        };
        CatalogDetail: {
            brands: components["schemas"]["Brand"][];
            gyms: components["schemas"]["Gym"][];
            snapshotVersion: string;
        };
        Actor: {
            /** Format: uuid */
            actorId: string;
            accountId: string | null;
            name: string | null;
            photoFileId: string | null;
            /** @enum {string} */
            state: "active" | "left" | "anonymous";
        };
        HistoryTimeChange: {
            /** @enum {string} */
            field: "scheduledAt" | "visitedAt";
            before: string | null;
            after: string | null;
        };
        HistoryTextChange: {
            /** @enum {string} */
            field: "description" | "memo" | "timeZone" | "status";
            before: string | null;
            after: string | null;
        };
        HistoryIdChange: {
            /** @enum {string} */
            field: "gymId" | "linkedRecordId" | "sharedFileId";
            before: string | null;
            after: string | null;
        };
        HistoryAttendeeChange: {
            /** @enum {string} */
            field: "attendeeActorIds";
            before: string[] | null;
            after: string[] | null;
        };
        ProfileDraftInput: {
            /** @constant */
            purpose: "profile";
        };
        AdminDraftInput: {
            /** @enum {string} */
            purpose: "brand_logo" | "announcement";
        };
        AttendanceSelection: {
            retainAttendanceIds: string[];
            addAccountIds: string[];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    createLoginChallenge: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginChallenge"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileSession"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    refreshSession: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileSession"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmptyResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminLogin: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminLoginInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminSession"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminSession"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminLogout: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmptyResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getMyProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Profile"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteAccount: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    editMyProfile: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Profile"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSelectedCrew: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SelectedCrew"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    selectCrew: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SelectedCrewInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SelectedCrew"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    myCrews: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrewPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createCrew: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrewInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Crew"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCrew: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Crew"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    crewMembers: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
                q?: string;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    resolveInvite: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteResolveInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitePreview"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    joinCrew: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["JoinInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Crew"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCrewInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Invite"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    transferAdministrator: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TransferInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Crew"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewAccountDeletion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountLifecyclePreview"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewLeaveCrew: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountLifecyclePreview"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    leaveCrew: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmptyResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listBrands: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    searchGyms: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
                q?: string;
                brandId?: string;
                bounds?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GymPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    gymDetail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                gymId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GymDetail"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminListBrand: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminCreateBrand: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrandInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Brand"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminGetBrand: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                brandId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Brand"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminEditBrand: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                brandId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrandInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Brand"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminListGym: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GymPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminCreateGym: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GymCreateInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Gym"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminGetGym: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                gymId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Gym"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminEditGym: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                gymId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GymInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Gym"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminListSettings: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                gymId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SettingPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminCreateSetting: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                gymId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SettingInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Setting"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminEditSetting: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                gymId: string;
                /** @description 안정적인 UUID 식별자 */
                settingId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SettingInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Setting"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminCancelSetting: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                gymId: string;
                /** @description 안정적인 UUID 식별자 */
                settingId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Setting"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listSchedules: {
        parameters: {
            query: {
                cursor?: string;
                pageSize?: number;
                startDate: string;
                endDate: string;
                timeZone: string;
                participation?: "all" | "mine";
                sort?: "upcoming" | "recent";
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SchedulePage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createSchedule: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScheduleInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Schedule"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    scheduleCalendar: {
        parameters: {
            query: {
                month: string;
                timeZone: string;
                participation?: "all" | "mine";
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScheduleCalendar"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSchedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                scheduleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ScheduleDetail"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    editSchedule: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                scheduleId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ScheduleInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Schedule"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    cancelSchedule: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                scheduleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Schedule"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    respondToSchedule: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                scheduleId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResponseInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Schedule"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    recommendGyms: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
                q?: string;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                scheduleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Recommendations"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    myRecords: {
        parameters: {
            query: {
                cursor?: string;
                pageSize?: number;
                startDate: string;
                endDate: string;
                timeZone: string;
                gymId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerRecordPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createPersonalRecord: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PersonalRecordInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerRecord"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    myRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                recordId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerRecord"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deletePersonalRecord: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                recordId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    editPersonalRecord: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                recordId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PersonalRecordUpdate"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerRecord"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createCrewVisit: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VisitInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrewVisit"];
                };
            };
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrewVisit"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    crewVisit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrewVisit"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteCrewVisit: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    editCrewVisit: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VisitUpdate"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CrewVisit"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    recordCandidates: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecordCandidatePage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    linkExistingRecord: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LinkInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LinkResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createLinkedRecord: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PersonalRecordInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LinkResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    unlinkRecord: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LinkResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    browseRecords: {
        parameters: {
            query: {
                cursor?: string;
                pageSize?: number;
                startDate: string;
                endDate: string;
                timeZone: string;
                view: "all" | "personal" | "crew";
                crewId?: string;
                gymId?: string;
                attendeeAccountIds?: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowseRowPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    recordCalendar: {
        parameters: {
            query: {
                month: string;
                timeZone: string;
                view: "all" | "personal" | "crew";
                crewId?: string;
                gymId?: string;
                attendeeAccountIds?: string[];
                startDate?: string;
                endDate?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecordCalendar"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    myStatistics: {
        parameters: {
            query: {
                period: "last_n_days" | "month" | "year" | "all" | "custom";
                timeZone: string;
                days?: number;
                month?: string;
                year?: number;
                startDate?: string;
                endDate?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Statistics"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    memberRecords: {
        parameters: {
            query: {
                cursor?: string;
                pageSize?: number;
                startDate: string;
                endDate: string;
                timeZone: string;
                gymId?: string;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                accountId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicRecordPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    memberRecord: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                accountId: string;
                /** @description 안정적인 UUID 식별자 */
                recordId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicRecord"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    memberStatistics: {
        parameters: {
            query: {
                period: "last_n_days" | "month" | "year" | "all" | "custom";
                timeZone: string;
                days?: number;
                month?: string;
                year?: number;
                startDate?: string;
                endDate?: string;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                accountId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Statistics"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    historySchedules: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                scheduleId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HistoryEventPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    revertSchedules: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                scheduleId: string;
                /** @description 안정적인 UUID 식별자 */
                eventId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MutationResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    historyVisits: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HistoryEventPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    revertVisits: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
                /** @description 안정적인 UUID 식별자 */
                eventId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MutationResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    notificationSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationSettings"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    editNotificationSettings: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["NotificationSettingsInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationSettings"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    registerDevice: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                deviceId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Device"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    unregisterDevice: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                deviceId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmptyResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    finishWorkout: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                clientWorkoutId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkoutFinishInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerRecord"];
                };
            };
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerRecord"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    appAnnouncements: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnnouncementList"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminAnnouncements: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnnouncementPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminCreateAnnouncement: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnnouncementInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Announcement"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminAnnouncement: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                announcementId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Announcement"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminEditAnnouncement: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                announcementId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnnouncementInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Announcement"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    adminDeleteAnnouncement: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                announcementId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createProfileImageDraft: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileDraftInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDraft"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createAdminImageDraft: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminDraftInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AssetDraft"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    myMediaLibrary: {
        parameters: {
            query?: {
                cursor?: string;
                pageSize?: number;
                kind?: "all" | "image" | "video";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MediaPage"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    startMedia: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MediaCreateInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadTicket"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    mediaInfo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Media"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteMedia: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retryMedia: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadTicket"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    completeMedia: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Media"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uploadDelete: {
        parameters: {
            query?: never;
            header: {
                "Tus-Resumable": "1.0.0";
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                uploadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            204: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    "Upload-Offset"?: number;
                    "Upload-Length"?: number;
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uploadHead: {
        parameters: {
            query?: never;
            header: {
                "Tus-Resumable": "1.0.0";
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                uploadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    "Upload-Offset"?: number;
                    "Upload-Length"?: number;
                    "Tus-Resumable"?: "1.0.0";
                    "Cache-Control"?: "no-store";
                    "X-Error-Code"?: "INVALID_INPUT" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VERSION_CONFLICT" | "PRECONDITION_REQUIRED" | "IDEMPOTENCY_MISMATCH" | "REQUEST_IN_PROGRESS" | "ALREADY_MEMBER" | "INVITE_INVALID" | "JOIN_BLOCKED" | "LINK_CONFLICT" | "LINKED_VISIT_LOCKED" | "DATE_GYM_MISMATCH" | "NOT_ATTENDEE" | "ACTIVE_RECORD_ELSEWHERE" | "ADMIN_TRANSFER_INVALID" | "ADMIN_TRANSFER_REQUIRED" | "ACCOUNT_DELETED" | "UPLOAD_OFFSET_CONFLICT" | "CHECKSUM_MISMATCH" | "UNSUPPORTED_MEDIA" | "MEDIA_NOT_READY" | "REUPLOAD_REQUIRED" | "RANGE_NOT_SATISFIABLE" | "TEMPORARY_FAILURE" | "QUERY_SNAPSHOT_CHANGED" | "TIME_REQUIRED" | "ACTUAL_VISIT_IN_FUTURE" | "WORKOUT_RESULT_DELETED";
                    "X-Retryable"?: "true" | "false";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    "Cache-Control"?: "no-store";
                    "Tus-Resumable"?: "1.0.0";
                    "X-Error-Code"?: "INVALID_INPUT" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VERSION_CONFLICT" | "PRECONDITION_REQUIRED" | "IDEMPOTENCY_MISMATCH" | "REQUEST_IN_PROGRESS" | "ALREADY_MEMBER" | "INVITE_INVALID" | "JOIN_BLOCKED" | "LINK_CONFLICT" | "LINKED_VISIT_LOCKED" | "DATE_GYM_MISMATCH" | "NOT_ATTENDEE" | "ACTIVE_RECORD_ELSEWHERE" | "ADMIN_TRANSFER_INVALID" | "ADMIN_TRANSFER_REQUIRED" | "ACCOUNT_DELETED" | "UPLOAD_OFFSET_CONFLICT" | "CHECKSUM_MISMATCH" | "UNSUPPORTED_MEDIA" | "MEDIA_NOT_READY" | "REUPLOAD_REQUIRED" | "RANGE_NOT_SATISFIABLE" | "TEMPORARY_FAILURE" | "QUERY_SNAPSHOT_CHANGED" | "TIME_REQUIRED" | "ACTUAL_VISIT_IN_FUTURE" | "WORKOUT_RESULT_DELETED";
                    "X-Retryable"?: "true" | "false";
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    uploadPatch: {
        parameters: {
            query?: never;
            header: {
                "Tus-Resumable": "1.0.0";
                "Upload-Offset": number;
                "Upload-Checksum"?: string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                uploadId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/offset+octet-stream": string;
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            204: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    "Upload-Offset"?: number;
                    "Upload-Length"?: number;
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readThumbnail: {
        parameters: {
            query?: never;
            header?: {
                Range?: string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            200: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            206: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readContent: {
        parameters: {
            query?: never;
            header?: {
                Range?: string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            200: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            206: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    startMediaAdmin: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MediaCreateInput"];
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            201: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadTicket"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    mediaInfoAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Media"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteMediaAdmin: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeleteResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retryMediaAdmin: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadTicket"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    completeMediaAdmin: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Media"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uploadDeleteAdmin: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
                "Tus-Resumable": "1.0.0";
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                uploadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            204: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    "Upload-Offset"?: number;
                    "Upload-Length"?: number;
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uploadHeadAdmin: {
        parameters: {
            query?: never;
            header: {
                "Tus-Resumable": "1.0.0";
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                uploadId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    "Upload-Offset"?: number;
                    "Upload-Length"?: number;
                    "Tus-Resumable"?: "1.0.0";
                    "Cache-Control"?: "no-store";
                    "X-Error-Code"?: "INVALID_INPUT" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VERSION_CONFLICT" | "PRECONDITION_REQUIRED" | "IDEMPOTENCY_MISMATCH" | "REQUEST_IN_PROGRESS" | "ALREADY_MEMBER" | "INVITE_INVALID" | "JOIN_BLOCKED" | "LINK_CONFLICT" | "LINKED_VISIT_LOCKED" | "DATE_GYM_MISMATCH" | "NOT_ATTENDEE" | "ACTIVE_RECORD_ELSEWHERE" | "ADMIN_TRANSFER_INVALID" | "ADMIN_TRANSFER_REQUIRED" | "ACCOUNT_DELETED" | "UPLOAD_OFFSET_CONFLICT" | "CHECKSUM_MISMATCH" | "UNSUPPORTED_MEDIA" | "MEDIA_NOT_READY" | "REUPLOAD_REQUIRED" | "RANGE_NOT_SATISFIABLE" | "TEMPORARY_FAILURE" | "QUERY_SNAPSHOT_CHANGED" | "TIME_REQUIRED" | "ACTUAL_VISIT_IN_FUTURE" | "WORKOUT_RESULT_DELETED";
                    "X-Retryable"?: "true" | "false";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    "Cache-Control"?: "no-store";
                    "Tus-Resumable"?: "1.0.0";
                    "X-Error-Code"?: "INVALID_INPUT" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VERSION_CONFLICT" | "PRECONDITION_REQUIRED" | "IDEMPOTENCY_MISMATCH" | "REQUEST_IN_PROGRESS" | "ALREADY_MEMBER" | "INVITE_INVALID" | "JOIN_BLOCKED" | "LINK_CONFLICT" | "LINKED_VISIT_LOCKED" | "DATE_GYM_MISMATCH" | "NOT_ATTENDEE" | "ACTIVE_RECORD_ELSEWHERE" | "ADMIN_TRANSFER_INVALID" | "ADMIN_TRANSFER_REQUIRED" | "ACCOUNT_DELETED" | "UPLOAD_OFFSET_CONFLICT" | "CHECKSUM_MISMATCH" | "UNSUPPORTED_MEDIA" | "MEDIA_NOT_READY" | "REUPLOAD_REQUIRED" | "RANGE_NOT_SATISFIABLE" | "TEMPORARY_FAILURE" | "QUERY_SNAPSHOT_CHANGED" | "TIME_REQUIRED" | "ACTUAL_VISIT_IN_FUTURE" | "WORKOUT_RESULT_DELETED";
                    "X-Retryable"?: "true" | "false";
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    uploadPatchAdmin: {
        parameters: {
            query?: never;
            header: {
                "X-CSRF-Token": string;
                "Tus-Resumable": "1.0.0";
                "Upload-Offset": number;
                "Upload-Checksum"?: string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                uploadId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/offset+octet-stream": string;
            };
        };
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            204: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    "Upload-Offset"?: number;
                    "Upload-Length"?: number;
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    "Tus-Resumable"?: "1.0.0";
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readThumbnailAdmin: {
        parameters: {
            query?: never;
            header?: {
                Range?: string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            200: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            206: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readContentAdmin: {
        parameters: {
            query?: never;
            header?: {
                Range?: string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            200: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 권한을 확인한 바이너리. Cache-Control: private, no-store. 현재권한 요청마다 검사 */
            206: {
                headers: {
                    "Content-Type"?: string;
                    "Content-Length"?: number;
                    "Accept-Ranges"?: "bytes";
                    "Content-Range"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readAnnouncementImage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 현재 공지에 등록된 이미지에 한해 공개; 다른 purpose 파일은404 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/*": string;
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    unshareDirectCrewMedia: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "If-Match": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                crewId: string;
                /** @description 안정적인 UUID 식별자 */
                visitId: string;
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MutationResult"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    reuploadMedia: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadTicket"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uploadOptions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            204: {
                headers: {
                    "Tus-Version"?: "1.0.0";
                    "Tus-Extension"?: "termination,checksum";
                    "Tus-Checksum-Algorithm"?: "sha256";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    reuploadMediaAdmin: {
        parameters: {
            query?: never;
            header: {
                "Idempotency-Key": string;
                "X-CSRF-Token": string;
            };
            path: {
                /** @description 안정적인 UUID 식별자 */
                fileId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            200: {
                headers: {
                    "X-Request-Id"?: string;
                    ETag?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadTicket"];
                };
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    uploadOptionsAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 요청 성공; 현재 권한으로 구성한 결과 */
            204: {
                headers: {
                    "Tus-Version"?: "1.0.0";
                    "Tus-Extension"?: "termination,checksum";
                    "Tus-Checksum-Algorithm"?: "sha256";
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 실패 형식. HTTP 상태/코드 대응은 conventions.md 원본 */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
