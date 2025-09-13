"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeftIcon,
  SaveIcon,
  AlertCircleIcon,
  UserCircle2Icon,
  CheckCircleIcon,
  BriefcaseIcon,
  UploadIcon,
  PaperclipIcon,
  EyeIcon,
  Loader2Icon,
  GlobeIcon,
  LanguagesIcon,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { UserAvailabilityStatus, Workgroup } from "@prisma/client"
import type { ProfileFormData } from "@/lib/types"

interface Country {
  code: string
  name: string
}

interface Language {
  code: string
  name: string
}

const initialFormData: ProfileFormData = {
  fullname: "",
  image: "",
  status: "",
  skills: "",
  country: "", // Guardaremos el nombre del país
  languages: "", // Guardaremos el nombre del idioma principal
  professionalProfile: {
    tagline: "",
    bio: "",
    experience: "",
    linkCv: "",
  },
  socialLinks: {
    facebook: "",
    linkedin: "",
    github: "",
    x: "",
  },
  selectedWorkgroupIds: [],
}

export default function EditProfilePage() {
  const router = useRouter()
  const { data: session, status: sessionStatus, update: updateSession } = useSession()
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData)
  const [allWorkgroups, setAllWorkgroups] = useState<Workgroup[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)

  const [isUploadingCv, setIsUploadingCv] = useState(false)
  const [cvFilename, setCvFilename] = useState<string | null>(null)
  const cvFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStatus === "loading") return
    if (sessionStatus === "unauthenticated") {
      router.replace("/")
      return
    }

    const fetchInitialData = async () => {
      try {
        setIsLoading(true)
        const [profileRes, workgroupsRes, countriesRes, languagesRes] = await Promise.all([
          fetch("/api/user-profile"),
          fetch("/api/workgroups"),
          fetch("/api/countries"),
          fetch("/api/languages"),
        ])

        if (!profileRes.ok) throw new Error("Failed to fetch profile data")
        const profileData = await profileRes.json()

        if (!workgroupsRes.ok) throw new Error("Failed to fetch workgroups")
        const workgroupsData = await workgroupsRes.json()
        setAllWorkgroups(workgroupsData)

        if (!countriesRes.ok) throw new Error("Failed to fetch countries")
        const countriesData = await countriesRes.json()
        setCountries(countriesData)

        if (!languagesRes.ok) throw new Error("Failed to fetch languages")
        const languagesData = await languagesRes.json()
        setLanguages(languagesData)

        const currentUserWorkgroupIds = profileData.workgroups?.map((wg: Workgroup) => wg.id) || []

        setFormData({
          fullname: profileData.fullname || "",
          image: profileData.image || "",
          status: profileData.status || "",
          skills: profileData.skills || "",
          country: profileData.country || "", // Campo existente
          languages: profileData.languages || "", // Campo existente
          professionalProfile: {
            tagline: profileData.professionalProfile?.tagline || "",
            bio: profileData.professionalProfile?.bio || "",
            experience: profileData.professionalProfile?.experience || "",
            linkCv: profileData.professionalProfile?.linkCv || "",
          },
          socialLinks: {
            facebook: profileData.socialLinks?.facebook || "",
            linkedin: profileData.socialLinks?.linkedin || "",
            github: profileData.socialLinks?.github || "",
            x: profileData.socialLinks?.x || "",
          },
          selectedWorkgroupIds: currentUserWorkgroupIds,
        })

        if (profileData.image) setAvatarPreview(profileData.image)
        if (profileData.professionalProfile?.linkCv) {
          setCvFilename(getFilenameFromUrl(profileData.professionalProfile.linkCv, "CV Document"))
        }
      } catch (err: any) {
        setError(err.message || "Could not load initial data.")
        console.error("Error fetching initial data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionStatus === "authenticated") {
      fetchInitialData()
    }
  }, [sessionStatus, router])

  const getFilenameFromUrl = (url: string, defaultName = "File"): string => {
    try {
      const parsedUrl = new URL(url)
      const pathParts = parsedUrl.pathname.split("/")
      const blobFilename = pathParts[pathParts.length - 1]
      const match = blobFilename.match(/^\d+-(.+)$/)
      return match && match[1] ? decodeURIComponent(match[1]) : decodeURIComponent(blobFilename)
    } catch (e) {
      return defaultName
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("professionalProfile.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        professionalProfile: { ...prev.professionalProfile, [field]: value },
      }))
    } else if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") {
      setFormData((prev) => ({ ...prev, status: value as UserAvailabilityStatus | "" }))
    } else if (name === "country") {
      setFormData((prev) => ({ ...prev, country: value }))
    } else if (name === "languages") {
      setFormData((prev) => ({ ...prev, languages: value }))
    }
  }

  const handleWorkgroupChange = (workgroupId: string) => {
    setFormData((prev) => {
      const newSelectedIds = prev.selectedWorkgroupIds.includes(workgroupId)
        ? prev.selectedWorkgroupIds.filter((id) => id !== workgroupId)
        : [...prev.selectedWorkgroupIds, workgroupId]
      return { ...prev, selectedWorkgroupIds: newSelectedIds }
    })
  }

  const handleFileUpload = async (file: File, uploadType: "avatar" | "cv") => {
    if (!file) return
    const setIsUploading = uploadType === "avatar" ? setIsUploadingAvatar : setIsUploadingCv
    setIsUploading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch(
        `/api/upload-blob?filename=${encodeURIComponent(file.name)}&uploadType=${uploadType}`,
        { method: "POST", body: file, headers: { "Content-Type": file.type } },
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to upload ${uploadType}`)
      }
      const blob = await response.json()
      if (uploadType === "avatar") {
        if (formData.image && formData.image !== blob.url && formData.image.includes("blob.vercel-storage.com")) {
          await fetch(`/api/upload-blob?url=${encodeURIComponent(formData.image)}`, { method: "DELETE" })
        }
        setFormData((prev) => ({ ...prev, image: blob.url }))
        setAvatarPreview(blob.url)
        setSuccessMessage("Avatar updated successfully!")
      } else {
        if (
          formData.professionalProfile.linkCv &&
          formData.professionalProfile.linkCv !== blob.url &&
          formData.professionalProfile.linkCv.includes("blob.vercel-storage.com")
        ) {
          await fetch(`/api/upload-blob?url=${encodeURIComponent(formData.professionalProfile.linkCv)}`, {
            method: "DELETE",
          })
        }
        setFormData((prev) => ({
          ...prev,
          professionalProfile: { ...prev.professionalProfile, linkCv: blob.url },
        }))
        setCvFilename(file.name)
        setSuccessMessage("CV updated successfully!")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
      if (uploadType === "avatar" && avatarFileRef.current) avatarFileRef.current.value = ""
      if (uploadType === "cv" && cvFileRef.current) cvFileRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch("/api/user-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }
      const updatedProfile = await response.json()
      if (session?.user?.image !== updatedProfile.image || session?.user?.status !== updatedProfile.status) {
        await updateSession({
          ...session,
          user: { ...session?.user, image: updatedProfile.image, status: updatedProfile.status },
        })
      }
      setSuccessMessage("Profile saved successfully!")
      router.push('/dashboard/profile')
      // const currentUserWorkgroupIds = updatedProfile.workgroups?.map((wg: Workgroup) => wg.id) || []
      // setFormData({
      //   fullname: updatedProfile.fullname || "",
      //   image: updatedProfile.image || "",
      //   status: updatedProfile.status || "",
      //   skills: updatedProfile.skills || "",
      //   country: updatedProfile.country || "",
      //   languages: updatedProfile.languages || "",
      //   professionalProfile: {
      //     tagline: updatedProfile.professionalProfile?.tagline || "",
      //     bio: updatedProfile.professionalProfile?.bio || "",
      //     experience: updatedProfile.professionalProfile?.experience || "",
      //     linkCv: updatedProfile.professionalProfile?.linkCv || "",
      //   },
      //   socialLinks: {
      //     facebook: updatedProfile.socialLinks?.facebook || "",
      //     linkedin: updatedProfile.socialLinks?.linkedin || "",
      //     github: updatedProfile.socialLinks?.github || "",
      //     x: updatedProfile.socialLinks?.x || "",
      //   },
      //   selectedWorkgroupIds: currentUserWorkgroupIds,
      // })
      // if (updatedProfile.image) setAvatarPreview(updatedProfile.image)
      // if (updatedProfile.professionalProfile?.linkCv) {
      //   setCvFilename(getFilenameFromUrl(updatedProfile.professionalProfile.linkCv, "CV Document"))
      // } else {
      //   setCvFilename(null)
      // }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving your profile.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2Icon className="h-16 w-16 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard")}
        className="mb-6 bg-slate-800 border-secondary hover:bg-slate-700 text-slate-300 hover:text-slate-100"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="bg-slate-800 border-secondary max-w-3xl mx-auto overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCircle2Icon className="h-8 w-8 text-purple-400" />
            <div>
              <CardTitle className="text-xl font-bold tracking-wide">Edit Your Profile</CardTitle>
              <CardDescription className="text-slate-400">
                Update your personal information. Your Discord username ({session?.user?.name}) cannot be changed here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
                <AlertCircleIcon className="h-5 w-5 text-red-400" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default" className="bg-green-900/30 border-green-700 text-green-300">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <section>
              <h3 className="text-lg font-semibold text-purple-300 mb-4 border-b border-secondary pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="bg-slate-700 border-secondary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="avatarFile">Avatar Image</Label>
                  <div className="flex items-end gap-3">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview || "/placeholder.svg"}
                        alt="Avatar Preview"
                        className="h-20 w-20 rounded-full object-cover border-2 border-secondary"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center border-2 border-secondary">
                        <UserCircle2Icon className="h-10 w-10 text-slate-500" />
                      </div>
                    )}
                    <div className="grow space-y-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => avatarFileRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="w-full bg-slate-700 border-secondary hover:bg-slate-600"
                      >
                        {isUploadingAvatar ? (
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UploadIcon className="mr-2 h-4 w-4" />
                        )}
                        {isUploadingAvatar ? "Uploading..." : "Upload Image"}
                      </Button>
                      <Input
                        ref={avatarFileRef}
                        id="avatarFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "avatar")}
                        className="hidden"
                      />
                      <Input
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Or paste image URL"
                        type="url"
                        className="bg-slate-700 border-secondary text-xs"
                        disabled={isUploadingAvatar}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Availability Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-secondary">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-secondary text-slate-50">
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="BUSY">Busy</SelectItem>
                      <SelectItem value="VERY_BUSY">Very Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selector de País */}
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="flex items-center">
                    <GlobeIcon className="mr-2 h-4 w-4 text-slate-400" /> Country
                  </Label>
                  <Select
                    name="country"
                    value={formData.country} // Guardamos el nombre del país
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-secondary">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-secondary text-slate-50 max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selector de Idioma */}
                <div className="space-y-1.5">
                  <Label htmlFor="languages" className="flex items-center">
                    <LanguagesIcon className="mr-2 h-4 w-4 text-slate-400" /> Main Language
                  </Label>
                  <Select
                    name="languages"
                    value={formData.languages} // Guardamos el nombre del idioma
                    onValueChange={(value) => handleSelectChange("languages", value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-secondary">
                      <SelectValue placeholder="Select your main language" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-secondary text-slate-50 max-h-60">
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.name}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">You can list more languages in your bio or skills.</p>
                </div>
              </div>
              <div className="space-y-1.5 mt-4">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., Project Management, Solidity"
                  className="bg-slate-700 border-secondary min-h-[70px]"
                />
              </div>
            </section>

            {/* Workgroups Section (sin cambios) */}
            <section>
              <h3 className="text-lg font-semibold text-purple-300 mb-4 border-b border-secondary pb-2 flex items-center">
                <BriefcaseIcon className="mr-2 h-5 w-5" /> Workgroups
              </h3>
              {allWorkgroups.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 rounded-md border border-secondary bg-slate-800/30">
                  {allWorkgroups.toReversed().map((wg) => (
                    <div key={wg.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-700/50">
                      <Checkbox
                        id={`wg-${wg.id}`}
                        checked={formData.selectedWorkgroupIds.includes(wg.id)}
                        onCheckedChange={() => handleWorkgroupChange(wg.id)}
                        className="border-slate-500 data-[state=checked]:bg-purple-600 data-[state=checked]:text-white"
                      />
                      <Label htmlFor={`wg-${wg.id}`} className="font-normal text-slate-300 cursor-pointer text-sm">
                        {wg.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Loading workgroups...</p>
              )}
            </section>

            {/* Professional Profile Section (sin cambios) */}
            <section>
              <h3 className="text-lg font-semibold text-purple-300 mb-4 border-b border-secondary pb-2">
                Professional Profile
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="professionalProfile.tagline">Tagline</Label>
                  <Input
                    id="professionalProfile.tagline"
                    name="professionalProfile.tagline"
                    value={formData.professionalProfile.tagline}
                    onChange={handleChange}
                    className="bg-slate-700 border-secondary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="professionalProfile.bio">Bio</Label>
                  <Textarea
                    id="professionalProfile.bio"
                    name="professionalProfile.bio"
                    value={formData.professionalProfile.bio}
                    onChange={handleChange}
                    className="bg-slate-700 border-secondary min-h-[90px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="professionalProfile.experience">Experience</Label>
                  <Textarea
                    id="professionalProfile.experience"
                    name="professionalProfile.experience"
                    value={formData.professionalProfile.experience}
                    onChange={handleChange}
                    className="bg-slate-700 border-secondary min-h-[90px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvFile">CV Document (PDF)</Label>
                  {cvFilename && formData.professionalProfile.linkCv && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-700/60 rounded-md border border-secondary text-sm">
                      <div className="flex items-center gap-2 truncate">
                        <PaperclipIcon className="h-4 w-4 text-purple-400 shrink-0" />
                        <span className="text-slate-300 truncate" title={cvFilename}>
                          {cvFilename}
                        </span>
                      </div>
                      <a
                        href={formData.professionalProfile.linkCv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 p-1"
                        title="View CV"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cvFileRef.current?.click()}
                      disabled={isUploadingCv}
                      className="bg-slate-700 border-secondary hover:bg-slate-600"
                    >
                      {isUploadingCv ? (
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UploadIcon className="mr-2 h-4 w-4" />
                      )}
                      {isUploadingCv ? "Uploading..." : "Upload PDF"}
                    </Button>
                    <Input
                      ref={cvFileRef}
                      id="cvFile"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "cv")}
                      className="hidden"
                    />
                  </div>
                  <Input
                    id="professionalProfile.linkCv"
                    name="professionalProfile.linkCv"
                    value={formData.professionalProfile.linkCv}
                    onChange={handleChange}
                    placeholder="Or paste CV URL"
                    type="url"
                    className="bg-slate-700 border-secondary mt-2 text-xs"
                    disabled={isUploadingCv}
                  />
                </div>
              </div>
            </section>

            {/* Social Links Section (sin cambios) */}
            <section>
              <h3 className="text-lg font-semibold text-purple-300 mb-4 border-b border-secondary pb-2">
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="socialLinks.facebook">Facebook URL</Label>
                  <Input
                    id="socialLinks.facebook"
                    name="socialLinks.facebook"
                    value={formData.socialLinks.facebook}
                    type="url"
                    onChange={handleChange}
                    className="bg-slate-700 border-secondary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialLinks.linkedin">LinkedIn URL</Label>
                  <Input
                    id="socialLinks.linkedin"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    type="url"
                    onChange={handleChange}
                    className="bg-slate-700 border-secondary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialLinks.github">GitHub URL</Label>
                  <Input
                    id="socialLinks.github"
                    name="socialLinks.github"
                    value={formData.socialLinks.github}
                    onChange={handleChange}
                    type="url"
                    className="bg-slate-700 border-secondary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="socialLinks.x">X (Twitter) URL</Label>
                  <Input
                    id="socialLinks.x"
                    name="socialLinks.x"
                    value={formData.socialLinks.x}
                    onChange={handleChange}
                    type="url"
                    className="bg-slate-700 border-secondary"
                  />
                </div>
              </div>
            </section>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting || isUploadingAvatar || isUploadingCv}
            >
              {isSubmitting || isUploadingAvatar || isUploadingCv ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="mr-2 h-4 w-4" />
              )}
              {isSubmitting
                ? "Saving Profile..."
                : isUploadingAvatar || isUploadingCv
                  ? "Processing File..."
                  : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
