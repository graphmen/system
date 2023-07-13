document.addEventListener('DOMContentLoaded', function() {
    const imageGallery = document.querySelector('.image-gallery');
    const images = []; // Array to store the image elements
    let currentIndex = 0; // Current index of the displayed image
    let slideshowInterval; // Variable to hold the slideshow interval
  
    // Array of district names
    const districtNames = [
      'Bulawayo', 'Harare', 'Buhera', 'Chimanimani', 'Chipinge', 'Makoni', 'Mutare', 'Mutasa', 'Nyanga', 'Bindura',
      'Muzarabani', 'Guruve', 'Mazowe', 'Mount Darwin', 'Rushinga', 'Shamva', 'Chikomba', 'Goromonzi', 'Marondera',
      'Mudzi', 'Murehwa', 'Mutoko', 'Seke', 'UMP', 'Wedza', 'Chegutu', 'Hurungwe', 'Kadoma', 'Kariba', 'Makonde',
      'Zvimba', 'Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Masvingo', 'Mwenezi', 'Zaka', 'Binga', 'Bubi', 'Hwange',
      'Lupane', 'Nkayi', 'Tsholotsho', 'Umguza', 'Beitbridge', 'Bulilima', 'Gwanda', 'Insiza', 'Mangwe', 'Matobo',
      'Umzingwane', 'Chirumhanzu', 'GokweNorth', 'GokweSouth', 'Gweru', 'Kwekwe', 'Mberengwa', 'Shurugwi', 'Zvishavane'
    ];
  
    // Create image elements and store them in the 'images' array
    districtNames.forEach((district, index) => {
      const img = document.createElement('img');
      img.src = `timeseries/${district}.png`;
      img.alt = district;
      img.addEventListener('click', () => {
        if (imageGallery.classList.contains('slideshow')) {
          // Clicked on the slideshow image, go back to the grid
          clearInterval(slideshowInterval);
          showGridView();
        } else {
          // Clicked on the grid image, start the slideshow
          startSlideshow(index);
        }
      });
      img.classList.add('image-item');
      images.push(img);
    });
  
    // Function to start the slideshow at the specified index
    function startSlideshow(index) {
      currentIndex = index;
      showSlideshowView();
      showImage(currentIndex);
      slideshowInterval = setInterval(showNextImage, 5000);
    }
  
    // Function to show the grid view
    function showGridView() {
      imageGallery.classList.remove('slideshow');
      imageGallery.innerHTML = ''; // Clear the gallery
      images.forEach(img => {
        imageGallery.appendChild(img); // Add all images to the gallery
      });
    }
  
    // Function to show the slideshow view
    function showSlideshowView() {
      imageGallery.classList.add('slideshow');
      imageGallery.innerHTML = ''; // Clear the gallery
      imageGallery.appendChild(images[currentIndex]); // Add the current image to the gallery
    }
  
    // Function to show the next image in the slideshow
    function showNextImage() {
      currentIndex = (currentIndex + 1) % images.length; // Get the next index in a circular manner
      showImage(currentIndex);
    }
  
    // Function to show the image at the specified index
    function showImage(index) {
      imageGallery.innerHTML = ''; // Clear the gallery
      imageGallery.appendChild(images[index]); // Add the image at the specified index
    }
  
    // Show the initial grid view
    showGridView();
  });
  