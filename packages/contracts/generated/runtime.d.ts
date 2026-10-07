/* Generated from contract sources. Do not edit. */

export type Runtime = (ClimbCount | WorkoutDraft | WorkoutLifecycle | WorkoutDisplay | AnnouncementSuppression | PendingInvite | Route | PushPayload | NoticeEntry | OpenSourceManifest | MediaJob | NotificationJob | DomainEvent | StorageObjectRef | StorageStart | StorageAppend | StorageComplete | StorageCancel | StorageRead | StorageStat | StorageDelete | StorageResult)

export interface ClimbCount {
brandId: string
gradeKey: number
count: number
}
export interface WorkoutDraft {
clientWorkoutId: string
ownerAccountId: string
ownerInstallationId: string
gymId: string
gymName: string
startedAt: string
timeZone: string
climbs: ClimbCount[]
state: ("active" | "finishing" | "saved" | "cancelled")
savedPersonalRecordId: (string | null)
}
export interface WorkoutLifecycle {
kind: ("view_changed" | "backgrounded" | "os_process_reclaimed" | "user_force_quit" | "finish_requested" | "finish_succeeded" | "finish_failed" | "account_changed")
clientWorkoutId: string
occurredAt: string
personalRecordId: (string | null)
}
export interface WorkoutDisplay {
appName: "Holdlog"
gymName: string
startedAt: string
elapsedSeconds: number
climbTotal: number
tabContext: ("records" | "schedules" | "gyms" | "statistics" | "me")
barVisible: boolean
overlapAllowed: true
}
export interface AnnouncementSuppression {
localDate: string
timeZoneAtSelection: string
}
export interface PendingInvite {
code: string
receivedAt: string
}
export interface Route {
screenId: ("00.01" | "01.01" | "01.02" | "01.03" | "01.04" | "01.05" | "02.01" | "02.02" | "02.03" | "02.04" | "02.05" | "02.06" | "02.07" | "02.08" | "02.09" | "02.10" | "02.11" | "02.12" | "02.13" | "03.01" | "03.02" | "03.03" | "04.01" | "05.01" | "05.02" | "05.03" | "05.04" | "05.05" | "05.06" | "05.07" | "06.01" | "06.02" | "06.03" | "06.04" | "06.05" | "06.06" | "06.07" | "06.08" | "06.09" | "06.10" | "06.11" | "07.01" | "A02" | "A03" | "A04")
tabContext: ("records" | "schedules" | "gyms" | "statistics" | "me" | "admin" | "login")
crewId: (string | null)
scheduleId: (string | null)
visitId: (string | null)
personalRecordId: (string | null)
memberAccountId: (string | null)
gymId: (string | null)
inviteId: (string | null)
selectedDate: (string | null)
fileId: (string | null)
}
export interface PushPayload {
schemaVersion: "1"
eventId: string
kind: ("new_schedule" | "schedule_changed" | "schedule_cancelled" | "record_reminder")
crewId: string
scheduleId: string
destination: ("schedule_detail" | "crew_visit_create")
}
export interface NoticeEntry {
name: string
version: string
license: string
licenseText: string
notices: string[]
homepage: (string | null)
}
export interface OpenSourceManifest {
buildId: string
generatedAt: string
entries: NoticeEntry[]
}
export interface MediaJob {
jobId: string
jobKey: string
kind: ("media_transform" | "media_delete" | "storage_move")
fileId: string
generation: number
moveId: (string | null)
deletionTaskId: (string | null)
}
export interface NotificationJob {
jobId: string
jobKey: string
kind: ("notification_send" | "schedule_reminder")
eventId: (string | null)
recipientId: (string | null)
scheduleId: string
expectedScheduleVersion: number
basisLocalDate: (string | null)
}
export interface DomainEvent {
id: string
kind: ("schedule_created" | "schedule_changed" | "schedule_cancelled" | "visit_created" | "visit_changed" | "visit_deleted" | "record_linked" | "record_unlinked" | "file_access_revoked" | "catalog_changed" | "announcement_changed" | "media_transform_requested" | "storage_move_requested" | "record_relinked")
aggregateId: string
aggregateVersion: number
crewId: (string | null)
occurredAt: string
}
export interface StorageObjectRef {
storageBackendId: string
storageKey: string
generation: number
}
export interface StorageStart {
operation: "start"
fileId: string
generation: number
expectedBytes: number
sha256: string
}
export interface StorageAppend {
operation: "append"
uploadId: string
offset: number
length: number
chunkSha256: (string | null)
streamHandle: string
}
export interface StorageComplete {
operation: "complete"
uploadId: string
expectedBytes: number
sha256: string
}
export interface StorageCancel {
operation: "cancel"
uploadId: string
}
export interface StorageRead {
operation: "read"
object: StorageObjectRef
rangeStart: (number | null)
rangeEndInclusive: (number | null)
}
export interface StorageStat {
operation: "stat"
object: StorageObjectRef
}
export interface StorageDelete {
operation: "delete"
object: StorageObjectRef
}
export interface StorageResult {
operation: ("start" | "append" | "complete" | "cancel" | "read" | "stat" | "delete")
uploadId: (string | null)
object: (StorageObjectRef | null)
acceptedOffset: (number | null)
bytes: (number | null)
sha256: (string | null)
streamHandle: (string | null)
mimeType: (string | null)
outcome: ("ok" | "not_found" | "offset_conflict" | "checksum_mismatch" | "retryable_failure" | "permanent_failure")
}
