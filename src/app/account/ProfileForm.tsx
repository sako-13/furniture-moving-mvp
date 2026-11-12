"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({ displayName, preferredUnit }: { displayName: string; preferredUnit: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, {});
  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="field-label">Name</span>
          <input name="displayName" defaultValue={displayName} maxLength={80} className="input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="field-label">Default unit</span>
          <select name="preferredUnit" defaultValue={preferredUnit} className="input">
            <option value="in">Inches</option>
            <option value="cm">Centimeters</option>
            <option value="ft">Feet</option>
          </select>
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-dark">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        {state.saved && !pending && <p role="status" className="text-sm text-success">Saved</p>}
      </div>
    </form>
  );
}
