import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { UserAvailabilityStatus } from "@prisma/client" // Asegúrate que esto esté importado

// GET sigue igual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        fullname: true,
        email: true,
        image: true,
        walletAddress: true,
        status: true,
        skills: true,
        country: true,
        languages: true,
        professionalProfile: true,
        socialLinks: true,
        workgroups: {
          // Incluir los workgroups del usuario
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Actualizar el perfil del usuario autenticado
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const {
      fullname,
      image,
      walletAddress,
      status,
      skills,
      country,
      languages,
      professionalProfile,
      socialLinks,
      selectedWorkgroupIds, // Array de IDs de workgroups
    } = body

    if (status && !Object.values(UserAvailabilityStatus).includes(status as UserAvailabilityStatus)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const userDataToUpdate: any = {}
    if (fullname !== undefined) userDataToUpdate.fullname = fullname
    if (image !== undefined) userDataToUpdate.image = image
    if (walletAddress !== undefined) userDataToUpdate.walletAddress = walletAddress
    if (status !== undefined) userDataToUpdate.status = status as UserAvailabilityStatus
    if (skills !== undefined) userDataToUpdate.skills = skills
    if (country !== undefined) userDataToUpdate.country = country
    if (languages !== undefined) userDataToUpdate.languages = languages

    // Lógica para actualizar workgroups
    if (selectedWorkgroupIds && Array.isArray(selectedWorkgroupIds)) {
      userDataToUpdate.workgroups = {
        // Desconecta todos los workgroups actuales y conecta los nuevos seleccionados
        set: selectedWorkgroupIds.map((id: string) => ({ id })),
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: userDataToUpdate, // userDataToUpdate ahora incluye la lógica de workgroups
      })

      if (professionalProfile) {
        await tx.professionalProfile.upsert({
          where: { userId },
          update: {
            tagline: professionalProfile.tagline,
            bio: professionalProfile.bio,
            experience: professionalProfile.experience,
            linkCv: professionalProfile.linkCv,
          },
          create: {
            userId,
            tagline: professionalProfile.tagline,
            bio: professionalProfile.bio,
            experience: professionalProfile.experience,
            linkCv: professionalProfile.linkCv,
          },
        })
      }

      if (socialLinks) {
        await tx.socialLinks.upsert({
          where: { userId },
          update: {
            facebook: socialLinks.facebook,
            linkedin: socialLinks.linkedin,
            github: socialLinks.github,
            x: socialLinks.x,
          },
          create: {
            userId,
            facebook: socialLinks.facebook,
            linkedin: socialLinks.linkedin,
            github: socialLinks.github,
            x: socialLinks.x,
          },
        })
      }
    })

    const fullUserProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        fullname: true,
        email: true,
        image: true,
        walletAddress: true,
        status: true,
        skills: true,
        country: true,
        languages: true,
        professionalProfile: true,
        socialLinks: true,
        workgroups: {
          // Devolver los workgroups actualizados
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(fullUserProfile)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
