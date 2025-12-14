"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateTheme, updateUser } from "@/lib/redux/slices/authSlice";
import { userApi } from "@/lib/api/user";
import { toast } from "sonner";

export default function AccountPreferencesPage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      const userTheme =
        (user.profile?.theme as "light" | "dark" | "system") || "system";
      setTheme(userTheme);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await dispatch(
        updateUser({
          full_name: fullName,
        })
      ).unwrap();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.trim().length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const res = await userApi.changePassword({ newPassword });
      toast.success(res.message || "Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password.");
    }
  };

  const handleSaveTheme = async () => {
    try {
      await dispatch(updateTheme({ theme })).unwrap();
      toast.success("Theme updated!");
    } catch {
      toast.error("Failed to update theme.");
    }
  };

  return (
    <div className="max-w-4xl w-full py-6 mx-auto">
      <div className="mb-12">
        <h1 className="text-xl font-inter font-medium tracking-tight text-foreground">
          Preferences
        </h1>
      </div>
      <Card className="bg-white border border-neutral-300 shadow-none mb-8 gap-4 p-0">
        <CardContent className="p-0 flex flex-col gap-y-4">
          <div className="px-6 py-4  border-b border-neutral-300 m-0">
            <div className="text-lg font-inter font-medium tracking-tight text-foreground">
              Profile Information
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid  grid-cols-3 items-center gap-4">
              <Label className="text-sm text-muted-foreground">Full Name</Label>
              <Input
                className="col-span-2 px-3 py-2 shadow-none bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs w-72"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input
                className="col-span-2 px-3 py-2 shadow-none bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs w-72"
                value={user?.email || ""}
                disabled
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-muted-foreground">Name</Label>
              <Input
                className="col-span-2 px-3 py-2 shadow-none bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs w-72"
                value={user?.name || ""}
                disabled
              />
            </div>
          </div>

          <div className="flex gap-2 w-full justify-end border-t border-neutral-300 py-4 px-8">
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className=" p-0 bg-white border border-neutral-300 shadow-none mb-8 gap-4">
        <CardContent className="p-0 flex flex-col gap-y-4">
          <div className="px-6 py-4  border-b border-neutral-300 m-0">
            <div className="text-lg font-inter font-medium tracking-tight text-foreground">
              Change Password
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">New Password</Label>
              <Input
                type="password"
                className="col-span-2 bg-muted border-border w-72"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm">Confirm Password</Label>
              <Input
                type="password"
                className="col-span-2 bg-muted border-border w-72"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 w-full justify-end border-t border-neutral-300 py-4 px-8">
            <Button
              className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
              onClick={handleChangePassword}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="p-0 bg-white border border-neutral-300 shadow-none gap-4">
        <CardContent className="p-0  gap-8 border-t">
          <div className="px-6 py-4  border-b border-neutral-300 m-0">
            <div className="text-lg font-inter font-medium tracking-tight text-foreground">
              Appearance
            </div>
          </div>

          <div className="grid grid-cols-12 p-6">
            <div className="col-span-full md:col-span-4 flex flex-col gap-5">
              <Label>Theme Mode</Label>
              <p className="text-sm text-muted-foreground max-w-[210px]">
                Choose how DotPortion looks to you. Select a single theme, or
                sync with your system.
              </p>
            </div>

            <div className="col-span-full md:col-span-8 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground ">
                Dotportion will use your selected theme
              </p>
              <RadioGroup
                value={theme}
                onValueChange={(val) =>
                  setTheme(val as "light" | "dark" | "system")
                }
                className="grid grid-cols-3 gap-6"
              >
                {/* DARK */}
                <Label
                  htmlFor="dark"
                  className={`border border-border rounded-lg p-4 flex flex-col cursor-pointer ${
                    theme === "dark" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    width="160"
                    height="87"
                    src="/dark.svg"
                    alt="dark theme"
                    className="rounded-md border border-border"
                  />

                  <div className="flex items-center gap-2 w-full mb-1">
                    <RadioGroupItem value="dark" id="dark" className="" />
                    <p className="text-center text-sm ">Dark</p>
                  </div>
                </Label>

                {/* LIGHT */}
                <Label
                  htmlFor="light"
                  className={`border border-border rounded-lg p-4 flex flex-col cursor-pointer ${
                    theme === "light" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    width="160"
                    height="87"
                    src="/light.svg"
                    alt="light theme"
                    className="rounded-md border border-border"
                  />

                  <div className="flex items-center gap-2 w-full mb-1">
                    <RadioGroupItem value="light" id="light" className="" />
                    <p className="text-center text-sm">Light</p>
                  </div>
                </Label>

                {/* SYSTEM */}
                <Label
                  htmlFor="system"
                  className={`border border-border rounded-lg p-4 flex flex-col cursor-pointer ${
                    theme === "system" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    width="160"
                    height="87"
                    src="/system.svg"
                    alt="system theme"
                    className="rounded-md border border-border "
                  />
                  <div className="flex items-center gap-2 w-full mb-1">
                    <RadioGroupItem value="system" id="system" className="" />
                    <p className="text-center text-sm">System</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          </div>
          <div className="flex gap-2 w-full justify-end border-t border-neutral-300 py-4 px-8">
            <Button
              className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
              onClick={handleSaveTheme}
              disabled={isLoading}
            >
              Save Theme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
