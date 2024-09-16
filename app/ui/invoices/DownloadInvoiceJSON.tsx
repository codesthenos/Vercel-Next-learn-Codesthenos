'use client'


import { downloadJSON } from "@/app/lib/actions"
import { useState } from "react"

export default function DownloadButton ({ id }: { id: string }) {
  const [downloading, setDownloading] = useState(false)

  const handleClick = async () => {
    setDownloading(true)

    try {
      // call the server action to get the fileContent
      const response = await downloadJSON(id)
      if (response.error) throw new Error(response.error)
      // create the blob (binary object with content [fileContent] and options { type: ... })
      if (response.fileContent) {
        const blob = new Blob([response.fileContent], { type: 'application/json' })

        // create the anchor (link) we will use to click to trigger the download
        const link = document.createElement('a')
        // create the temporary URL for the anchor
        const url = window.URL.createObjectURL(blob)
        // setting the URL created to the href of the anchor
        link.href = url
        // name of the doc that will be downloaded
        link.download = `invoice-${id}.json`
        // inserting the anchor in the DOM
        document.body.appendChild(link)
        // click the anchor
        link.click()
        
        // clean up: remove Object URL and anchor element
        window.URL.revokeObjectURL(link.href)
        link.remove()
      }      
    } catch (error) {
      // manejar bien el error, no hace un log.
      console.log('Error downloading file', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={downloading} >
      {downloading ? 'downloading...' : '.json'}
    </button>
  )
}