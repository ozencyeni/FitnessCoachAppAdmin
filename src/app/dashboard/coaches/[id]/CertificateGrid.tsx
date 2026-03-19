'use client'

interface Certificate {
  id: string
  file_url: string
  file_name: string
  certificate_type: string | null
}

export default function CertificateGrid({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-3">📂</p>
        <p className="text-gray-400">Sertifika yüklenmemiş</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {certificates.map((cert) => (
        <a
          key={cert.id}
          href={cert.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-xl overflow-hidden border border-gray-700 hover:border-secondary transition"
        >
          <CertImage url={cert.file_url} name={cert.file_name} />
          <div className="p-3">
            <p className="text-sm text-white truncate">{cert.file_name}</p>
            {cert.certificate_type && (
              <p className="text-xs text-gray-400 mt-0.5">{cert.certificate_type}</p>
            )}
            <p className="text-xs text-secondary mt-1">Büyütmek için tıkla ↗</p>
          </div>
        </a>
      ))}
    </div>
  )
}

function CertImage({ url, name }: { url: string; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      className="w-full h-48 object-cover bg-gray-800 group-hover:opacity-90 transition"
      onError={(e) => {
        const target = e.currentTarget
        target.style.display = 'none'
        const placeholder = document.createElement('div')
        placeholder.className = 'w-full h-48 bg-gray-800 flex flex-col items-center justify-center gap-2'
        placeholder.innerHTML = `<span style="font-size:2rem">📄</span><span style="color:#9ca3af;font-size:0.75rem">${name}</span>`
        target.parentElement?.appendChild(placeholder)
      }}
    />
  )
}
