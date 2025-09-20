import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, fileName } = await req.json()
    
    console.log('Processing file:', fileName, 'URL:', fileUrl)
    
    // Check file extension
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (extension === 'ppt' || extension === 'pptx') {
      // Use Microsoft Office Online viewer for PowerPoint files
      const encodedUrl = encodeURIComponent(fileUrl)
      const embedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
      
      console.log('Generated Office viewer URL:', embedUrl)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          embedUrl,
          viewerType: 'office'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }
    
    // For other file types, return failure to use default doc viewer
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'File type not supported for enhanced viewing'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
    
  } catch (error) {
    console.error('Error in google-slides-embed function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})