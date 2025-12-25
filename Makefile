CC = g++

KOEI_VIEWER = koei_viewer
PALETTE_GEN = palette_gen
UNPACK = unpack

CFLAGS = -std=c++11
LDFLAGS = -lSDL2

all: $(KOEI_VIEWER) $(PALETTE_GEN) $(UNPACK)

$(KOEI_VIEWER): koei_viewer.cpp koei_image.cpp ls11_decoder.cpp buf_reader.cpp
	$(CC) -o $(KOEI_VIEWER) $(CFLAGS) koei_viewer.cpp koei_image.cpp ls11_decoder.cpp buf_reader.cpp $(LDFLAGS)

$(PALETTE_GEN): palette_gen.cpp
	$(CC) -o $(PALETTE_GEN) $(CFLAGS) palette_gen.cpp $(LDFLAGS)

$(UNPACK): unpack.cpp buf_reader.cpp
	$(CC) -o $(UNPACK) $(CFLAGS) unpack.cpp buf_reader.cpp $(LDFLAGS)

clean:
	@find . -name '*.o' -type f -delete
	@find . -name '$(KOEI_VIEWER)' -type f -delete
	@find . -name '$(PALETTE_GEN)' -type f -delete
	@find . -name '$(UNPACK)' -type f -delete
