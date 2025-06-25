// Mengekstrak segmen pathname dari path hash URL
function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

// Mengonversi segmen path menjadi pola route SPA
function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

// Mengambil pathname aktif dari hash URL
export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

// Mendapatkan route aktif berdasarkan hash URL
export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

// Mengekstrak segmen dari pathname aktif
export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

// Mendapatkan pola route dari pathname tertentu
export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

// Mengekstrak segmen dari pathname tertentu
export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
