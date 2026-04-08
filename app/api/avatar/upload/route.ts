import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Create unique filename with user ID
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `avatars/${user.id}/${Date.now()}.${extension}`

    // Upload to Blob storage (private access)
    const blob = await put(filename, file, {
      access: 'private',
    })

    // Update user profile with avatar pathname
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        avatar_url: blob.pathname,
        updated_at: new Date().toISOString(),
      })

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Still return success since the file was uploaded
    }

    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
