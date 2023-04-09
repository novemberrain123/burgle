# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "C:/Users/heihachi/esp/esp-idf/components/bootloader/subproject"
  "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader"
  "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader-prefix"
  "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader-prefix/tmp"
  "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader-prefix/src/bootloader-stamp"
  "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader-prefix/src"
  "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader-prefix/src/bootloader-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader-prefix/src/bootloader-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "D:/Code/burgle/esp32/esp-idf/blink/build/bootloader-prefix/src/bootloader-stamp${cfgdir}") # cfgdir has leading slash
endif()
