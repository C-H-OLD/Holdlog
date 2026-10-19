import { useSyncExternalStore } from 'react';
import type { EditProfile } from '../../lib/editProfile.ts';

/** Bind an account-scoped draft owner to the approved profile edit screen in T017. */
export function useEditProfile(edit: EditProfile) {
  const state = useSyncExternalStore(edit.subscribe, edit.getSnapshot, edit.getSnapshot);
  return { ...state, setName: edit.setName, submit: edit.submit, rebase: edit.rebase };
}
