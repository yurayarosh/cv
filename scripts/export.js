const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const http = require('http')

const { interval } = require('rxjs')
const { filter, first, mergeMap } = require('rxjs/operators')

const fetchResponse = () => {
  return new Promise((res, rej) => {
    try {
      const req = http.request('http://localhost:4000', response => res(response.statusCode))
      req.on('error', err => rej(err))
      req.end()
    } catch (err) {
      rej(err)
    }
  })
}

const waitForServerReachable = () => {
  return interval(1000).pipe(
    mergeMap(async () => {
      try {
        const statusCode = await fetchResponse()
        if (statusCode === 200) return true
      } catch (err) {}
      return false
    }),
    filter(ok => !!ok)
  )
}

const convert = async () => {
  await waitForServerReachable()
    .pipe(first())
    .toPromise()

  console.log('Connected to server ...')
  console.log('Exporting ...')
  try {
    const fullDirectoryPath = path.join(__dirname, '../pdf/')
    const directories = getResumesFromDirectories()
    directories.forEach(async dir => {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
      })
      const page = await browser.newPage()
      await page.goto('http://localhost:4000', {
        waitUntil: 'networkidle2',
      })

      if (!fs.existsSync(fullDirectoryPath)) {
        fs.mkdirSync(fullDirectoryPath)
      }
      await page.pdf({
        path: fullDirectoryPath + dir.name + '.pdf',
        format: 'A4',
      })
      await browser.close()
    })
  } catch (err) {
    throw new Error(err)
  }
  console.log('Finished exports.')
}

const getResumesFromDirectories = () => {
  const directories = getDirectories()
  return directories.map(dir => {
    const filePath = dir.replace('.html', '')
    const fileName = 'Yurii_Yaroshenko_CV'
    return {
      path: filePath,
      name: fileName,
    }
  })
}

const getDirectories = () => {
  const srcpath = path.join(__dirname, '../_site/')
  return fs.readdirSync(srcpath).filter(file => file === 'index.html')
}

convert()
