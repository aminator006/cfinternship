addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// handleRequest function will handle the request made from the url.
// Fetch function will fetch the response from the specified url.

async function handleRequest(request) {
  let repl = '';
  let response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
  if (response.ok) {
    let json = await response.json();
    let variants = json.variants;
    const cookie = request.headers.get('cookie')
    const NAME = 'initital'
    if (cookie && cookie.includes(`${NAME}=variant1`)) {
      repl = "variant1"
    } else if (cookie && cookie.includes(`${NAME}=variant2`)) {
      repl = "variant2"
    } else {
      repl = Math.random() < 0.5 ? 'variant1' : 'variant2' 
    }
    let url = repl == 'variant1' ? variants[0] : variants[1]
    let secCall = await fetch(url)
    if (secCall.ok) {
      let text = await secCall.text();
      response = new Response(text, {
        headers: { 'content-type': 'text/html' },
      });
      response.headers.append('Set-Cookie', `${NAME}=${repl}; path=/`)
      return new HTMLRewriter()
        .on('*', new AttributeRewriter(repl))
        .transform(response);
    } else {
      return new Response('Could not access the site', {
        headers: { 'content-type': 'text/html' },
      });
    }
  } else {
    return new Response(`Could not get URL's`, {
      headers: { 'content-type': 'text/plain' },
    })
  }
}


// class  responsible for changing the title, href and tags.
class AttributeRewriter {

  constructor(attributeName) {  // constructor to set the field for the variant 1/2
    this.attributeName = attributeName
  }

  element(element) {  //catches the element and updates its value.
    if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
      if (this.attributeName == 'variant1') {
        element.setInnerContent("Aman's LinkedIn Profile")
      } else {
        element.setInnerContent("Aman's Github Profile")
      }
    }

    if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
      if (this.attributeName == 'variant1') {
        element.setInnerContent("Let go to my LinkedIn profile")
      } else {
        element.setInnerContent("Check my projects")
      }
    }

    if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
      if (this.attributeName == 'variant1') {
        element.setInnerContent("linkedIn")
        element.setAttribute('href', "https://www.linkedin.com/in/thisisamansingh/")
      } else {
        element.setInnerContent("github")
        element.setAttribute('href', "https://github.com/aminator006")
      }
    }

    if (element.tagName == 'title') {
      if (this.attributeName == 'variant1') {
        element.setInnerContent('LinkedIn')
      } else {
        element.setInnerContent('Github')
      }
    }
  }
}

