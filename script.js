function filterSongs() {
   const selectedCounts = Array.from(
       document.querySelectorAll('input[name="memberCount"]:checked')
   ).map(item => item.value);
   const selectedTypes = Array.from(
       document.querySelectorAll('input[name="songType"]:checked')
   ).map(item => item.value);
   const selectedUnits = Array.from(
       document.querySelectorAll('input[name="unit"]:checked')
   ).map(item => item.value);
   const selectedYears = Array.from(
       document.querySelectorAll('input[name="year"]:checked')
   ).map(item => item.value);
   const searchText = document
       .getElementById('songSearch')
       .value
       .toLowerCase()
       .trim();
   document.querySelectorAll('.song').forEach(song => {
       const countMatch =
           selectedCounts.length === 0 ||
           selectedCounts.includes(song.dataset.count);
       const typeMatch =
           selectedTypes.length === 0 ||
           selectedTypes.includes(song.dataset.type);
       const unitMatch =
           selectedUnits.length === 0 ||
           selectedUnits.includes(song.dataset.unit);
       const songYear = song.dataset.date.substring(0, 4);
       const yearMatch =
           selectedYears.length === 0 ||
           selectedYears.includes(songYear);
       const songText = song.textContent.toLowerCase();
       const textMatch =
           searchText === '' ||
           songText.includes(searchText);
       song.style.display =
           countMatch &&
           typeMatch &&
           unitMatch &&
           yearMatch &&
           textMatch
               ? ''
               : 'none';
   });
}
document.addEventListener('DOMContentLoaded', () => {
   document.querySelectorAll(
       'input[name="memberCount"], ' +
       'input[name="songType"], ' +
       'input[name="unit"], ' +
       'input[name="year"]'
   ).forEach(checkbox => {
       checkbox.addEventListener('change', filterSongs);
   });
   document
       .getElementById('searchButton')
       .addEventListener('click', filterSongs);
});
