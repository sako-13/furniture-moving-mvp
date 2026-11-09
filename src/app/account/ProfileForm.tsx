"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({ displayName, preferredUnit }: { displayName: string; preferredUnit: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600">Name</span>
        <input
          name="displayName"
          defaultValue={displayName}
          maxLength={80}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600">Default unit in the simulator</span>
        <select
          name="preferredUnit"
          defaultValue={preferredUnit}
          className="rounded-md border border-slate-300 bg-white px-3 py-2"
        >
          <option value="in">Inches</option>
          <option value="cm">Centimeters</option>
          <option value="ft">Feet</option>
        </select>
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.saved && !pending && <p role="status" className="text-sm text-green-700">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
