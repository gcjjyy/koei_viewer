00000000  E90506            jmp 0x608
00000003  90                nop
00000004  FC                cld
00000005  2E8C166202        mov word [cs:0x262],ss
0000000A  2E89266402        mov [cs:0x264],sp
0000000F  0E                push cs
00000010  17                pop ss
00000011  BC0001            mov sp,0x100
00000014  FB                sti
00000015  60                pusha
00000016  1E                push ds
00000017  06                push es
00000018  8CCE              mov si,cs
0000001A  8EDE              mov ds,si
0000001C  8EC6              mov es,si
0000001E  BEDC06            mov si,0x6dc
00000021  BFD806            mov di,0x6d8
00000024  A5                movsw
00000025  A5                movsw
00000026  8EDB              mov ds,bx
00000028  8BF0              mov si,ax
0000002A  AD                lodsw
0000002B  32ED              xor ch,ch
0000002D  8AC8              mov cl,al
0000002F  AD                lodsw
00000030  D1E0              shl ax,0x0
00000032  D1E0              shl ax,0x0
00000034  D1E0              shl ax,0x0
00000036  D1E0              shl ax,0x0
00000038  8BF8              mov di,ax
0000003A  D1E0              shl ax,0x0
0000003C  D1E0              shl ax,0x0
0000003E  03F8              add di,ax
00000040  03F9              add di,cx
00000042  81C7800C          add di,0xc80
00000046  2E893E7E02        mov [cs:0x27e],di
0000004B  2E893EA505        mov [cs:0x5a5],di
00000050  AD                lodsw
00000051  8BD8              mov bx,ax
00000053  AD                lodsw
00000054  8BF8              mov di,ax
00000056  AD                lodsw
00000057  2EA29D02          mov [cs:0x29d],al
0000005B  AD                lodsw
0000005C  8EDB              mov ds,bx
0000005E  8BF7              mov si,di
00000060  32E4              xor ah,ah
00000062  2E88265102        mov [cs:0x251],ah
00000067  03C0              add ax,ax
00000069  05C806            add ax,0x6c8
0000006C  8BD8              mov bx,ax
0000006E  2EFF27            jmp word near [cs:bx]
00000071  90                nop
00000072  BFF806            mov di,0x6f8
00000075  0E                push cs
00000076  07                pop es
00000077  B90800            mov cx,0x8
0000007A  F3A7              repe cmpsw
0000007C  7503              jnz 0x81
0000007E  E9CC00            jmp 0x14d
00000081  FEC1              inc cl
00000083  2E880E5102        mov [cs:0x251],cl
00000088  E9C200            jmp 0x14d
0000008B  90                nop
0000008C  AC                lodsb
0000008D  32E4              xor ah,ah
0000008F  FEC8              dec al
00000091  03F0              add si,ax
00000093  AC                lodsb
00000094  2EA28402          mov [cs:0x284],al
00000098  2EA3A905          mov [cs:0x5a9],ax
0000009C  AC                lodsb
0000009D  8AD0              mov dl,al
0000009F  AC                lodsb
000000A0  8AE0              mov ah,al
000000A2  8AC2              mov al,dl
000000A4  2EA38102          mov [cs:0x281],ax
000000A8  2EA36C06          mov [cs:0x66c],ax
000000AC  2EA37705          mov [cs:0x577],ax
000000B0  2EA3F005          mov [cs:0x5f0],ax
000000B4  2EA3B905          mov [cs:0x5b9],ax
000000B8  AD                lodsw
000000B9  2EA38702          mov [cs:0x287],ax
000000BD  AC                lodsb
000000BE  2EA20102          mov [cs:0x201],al
000000C2  AC                lodsb
000000C3  D0C0              rol al,0x0
000000C5  D0C0              rol al,0x0
000000C7  7318              jnc 0xe1
000000C9  8AF0              mov dh,al
000000CB  2EA09D02          mov al,[cs:0x29d]
000000CF  A802              test al,0x2
000000D1  7409              jz 0xdc
000000D3  B91000            mov cx,0x10
000000D6  AD                lodsw
000000D7  E2FD              loop 0xd6
000000D9  EB04              jmp 0xdf
000000DB  90                nop
000000DC  83C620            add si,0x20
000000DF  8AC6              mov al,dh
000000E1  D0C0              rol al,0x0
000000E3  7311              jnc 0xf6
000000E5  32FF              xor bh,bh
000000E7  AC                lodsb
000000E8  8AD8              mov bl,al
000000EA  02DB              add bl,bl
000000EC  BA9090            mov dx,0x9090
000000EF  2E89364903        mov [cs:0x349],si
000000F4  03F3              add si,bx
000000F6  8CC8              mov ax,cs
000000F8  8EC0              mov es,ax
000000FA  BFF006            mov di,0x6f0
000000FD  B90400            mov cx,0x4
00000100  B200              mov dl,0x0
00000102  8ADA              mov bl,dl
00000104  D0EA              shr dl,0x0
00000106  D0EA              shr dl,0x0
00000108  83E303            and bx,0x3
0000010B  02DB              add bl,bl
0000010D  81C3E806          add bx,0x6e8
00000111  2E8B07            mov ax,[cs:bx]
00000114  AB                stosw
00000115  E2EB              loop 0x102
00000117  BACE03            mov dx,0x3ce
0000011A  B80100            mov ax,0x1
0000011D  EF                out dx,ax
0000011E  B003              mov al,0x3
00000120  EF                out dx,ax
00000121  B005              mov al,0x5
00000123  EF                out dx,ax
00000124  B808FF            mov ax,0xff08
00000127  EF                out dx,ax
00000128  B004              mov al,0x4
0000012A  EE                out dx,al
0000012B  BAC403            mov dx,0x3c4
0000012E  B002              mov al,0x2
00000130  EE                out dx,al
00000131  2EA1F006          mov ax,[cs:0x6f0]
00000135  E86000            call 0x198
00000138  2EA1F206          mov ax,[cs:0x6f2]
0000013C  E85900            call 0x198
0000013F  2EA1F406          mov ax,[cs:0x6f4]
00000143  E85200            call 0x198
00000146  2EA1F606          mov ax,[cs:0x6f6]
0000014A  E84B00            call 0x198
0000014D  07                pop es
0000014E  1F                pop ds
0000014F  61                popa
00000150  B000              mov al,0x0
00000152  FA                cli
00000153  2E8B266402        mov sp,[cs:0x264]
00000158  2E8E166202        mov ss,word [cs:0x262]
0000015D  CF                iret
0000015E  0000              add [bx+si],al
00000160  0000              add [bx+si],al
00000162  0000              add [bx+si],al
00000164  0000              add [bx+si],al
00000166  2EA21F04          mov [cs:0x41f],al
0000016A  2EA26705          mov [cs:0x567],al
0000016E  8AC8              mov cl,al
00000170  B001              mov al,0x1
00000172  D2E0              shl al,cl
00000174  BAC503            mov dx,0x3c5
00000177  EE                out dx,al
00000178  B800A0            mov ax,0xa000
0000017B  8EC0              mov es,ax
0000017D  BF0000            mov di,0x0
00000180  BA0000            mov dx,0x0
00000183  BD0000            mov bp,0x0
00000186  B80000            mov ax,0x0
00000189  8AD8              mov bl,al
0000018B  D1E8              shr ax,0x0
0000018D  D1E8              shr ax,0x0
0000018F  D1E8              shr ax,0x0
00000191  D1E8              shr ax,0x0
00000193  2EA38702          mov [cs:0x287],ax
00000197  C3                ret
00000198  3C03              cmp al,0x3
0000019A  7512              jnz 0x1ae
0000019C  B200              mov dl,0x0
0000019E  F6C201            test dl,0x1
000001A1  7501              jnz 0x1a4
000001A3  C3                ret
000001A4  E8BFFF            call 0x166
000001A7  83E30F            and bx,0xf
000001AA  7508              jnz 0x1b4
000001AC  EB13              jmp 0x1c1
000001AE  E8B5FF            call 0x166
000001B1  83E30F            and bx,0xf
000001B4  03DB              add bx,bx
000001B6  81C3CE06          add bx,0x6ce
000001BA  2EFF27            jmp word near [cs:bx]
000001BD  90                nop
000001BE  AC                lodsb
000001BF  8AF8              mov bh,al
000001C1  8BC5              mov ax,bp
000001C3  EB27              jmp 0x1ec
000001C5  90                nop
000001C6  AC                lodsb
000001C7  1E                push ds
000001C8  56                push si
000001C9  BEF006            mov si,0x6f0
000001CC  32E4              xor ah,ah
000001CE  D0E0              shl al,0x0
000001D0  03F0              add si,ax
000001D2  2E8B04            mov ax,[cs:si]
000001D5  8BF2              mov si,dx
000001D7  BACF03            mov dx,0x3cf
000001DA  EE                out dx,al
000001DB  B800A0            mov ax,0xa000
000001DE  8BD6              mov dx,si
000001E0  8ED8              mov ds,ax
000001E2  8BF7              mov si,di
000001E4  8BC5              mov ax,bp
000001E6  E81F00            call 0x208
000001E9  5E                pop si
000001EA  1F                pop ds
000001EB  C3                ret
000001EC  32E4              xor ah,ah
000001EE  BD5000            mov bp,0x50
000001F1  2BE8              sub bp,ax
000001F3  8AE0              mov ah,al
000001F5  8AC7              mov al,bh
000001F7  32ED              xor ch,ch
000001F9  8ACC              mov cl,ah
000001FB  90                nop
000001FC  AA                stosb
000001FD  83C700            add di,0x0
00000200  E2FA              loop 0x1fc
00000202  03FD              add di,bp
00000204  4A                dec dx
00000205  75F2              jnz 0x1f9
00000207  C3                ret
00000208  32E4              xor ah,ah
0000020A  BD5000            mov bp,0x50
0000020D  2BE8              sub bp,ax
0000020F  8AE0              mov ah,al
00000211  8AC7              mov al,bh
00000213  32ED              xor ch,ch
00000215  8ACC              mov cl,ah
00000217  90                nop
00000218  A4                movsb
00000219  83C700            add di,0x0
0000021C  E2FA              loop 0x218
0000021E  03FD              add di,bp
00000220  03F5              add si,bp
00000222  4A                dec dx
00000223  75F0              jnz 0x215
00000225  C3                ret
00000226  B85000            mov ax,0x50
00000229  2EA36306          mov [cs:0x663],ax
0000022D  90                nop
0000022E  AC                lodsb
0000022F  32E4              xor ah,ah
00000231  8BC8              mov cx,ax
00000233  D0E8              shr al,0x0
00000235  D0E8              shr al,0x0
00000237  D0E8              shr al,0x0
00000239  241E              and al,0x1e
0000023B  058806            add ax,0x688
0000023E  8BD8              mov bx,ax
00000240  2EFF27            jmp word near [cs:bx]
00000243  90                nop
00000244  8BC1              mov ax,cx
00000246  02C0              add al,al
00000248  BB0000            mov bx,0x0
0000024B  03D8              add bx,ax
0000024D  8B07              mov ax,[bx]
0000024F  8BC8              mov cx,ax
00000251  D0E8              shr al,0x0
00000253  D0E8              shr al,0x0
00000255  D0E8              shr al,0x0
00000257  83E03E            and ax,0x3e
0000025A  05A806            add ax,0x6a8
0000025D  8BD8              mov bx,ax
0000025F  2EFF27            jmp word near [cs:bx]
00000262  8AC5              mov al,ch
00000264  80E99E            sub cl,0x9e
00000267  32ED              xor ch,ch
00000269  EB2B              jmp 0x296
0000026B  90                nop
0000026C  8AC5              mov al,ch
0000026E  83E10F            and cx,0xf
00000271  FEC1              inc cl
00000273  E99C00            jmp 0x312
00000276  8AD9              mov bl,cl
00000278  8AE1              mov ah,cl
0000027A  80E40C            and ah,0xc
0000027D  D0CC              ror ah,0x0
0000027F  86CD              xchg cl,ch
00000281  80E5F0            and ch,0xf0
00000284  1E                push ds
00000285  E92001            jmp 0x3a8
00000288  8AE1              mov ah,cl
0000028A  8AC5              mov al,ch
0000028C  8AF9              mov bh,cl
0000028E  E97802            jmp 0x509
00000291  90                nop
00000292  80E99E            sub cl,0x9e
00000295  AC                lodsb
00000296  AA                stosb
00000297  4A                dec dx
00000298  7508              jnz 0x2a2
0000029A  E8C902            call 0x566
0000029D  740B              jz 0x2aa
0000029F  EB04              jmp 0x2a5
000002A1  90                nop
000002A2  E8BB02            call 0x560
000002A5  E2EF              loop 0x296
000002A7  EB85              jmp 0x22e
000002A9  90                nop
000002AA  C3                ret
000002AB  90                nop
000002AC  8AC5              mov al,ch
000002AE  83E10F            and cx,0xf
000002B1  EB05              jmp 0x2b8
000002B3  90                nop
000002B4  80E10F            and cl,0xf
000002B7  AC                lodsb
000002B8  8AE0              mov ah,al
000002BA  C0C004            rol al,byte 0x4
000002BD  C1C004            rol ax,byte 0x4
000002C0  EB07              jmp 0x2c9
000002C2  80E10F            and cl,0xf
000002C5  AC                lodsb
000002C6  8AE0              mov ah,al
000002C8  AC                lodsb
000002C9  41                inc cx
000002CA  2EA2E003          mov [cs:0x3e0],al
000002CE  8AC4              mov al,ah
000002D0  AA                stosb
000002D1  4A                dec dx
000002D2  7508              jnz 0x2dc
000002D4  E88F02            call 0x566
000002D7  74D1              jz 0x2aa
000002D9  EB04              jmp 0x2df
000002DB  90                nop
000002DC  E88102            call 0x560
000002DF  B000              mov al,0x0
000002E1  AA                stosb
000002E2  4A                dec dx
000002E3  7507              jnz 0x2ec
000002E5  E87E02            call 0x566
000002E8  74C0              jz 0x2aa
000002EA  EB03              jmp 0x2ef
000002EC  E87102            call 0x560
000002EF  E2DD              loop 0x2ce
000002F1  E93AFF            jmp 0x22e
000002F4  80E10F            and cl,0xf
000002F7  41                inc cx
000002F8  A4                movsb
000002F9  4A                dec dx
000002FA  7508              jnz 0x304
000002FC  E86702            call 0x566
000002FF  7445              jz 0x346
00000301  EB04              jmp 0x307
00000303  90                nop
00000304  E85902            call 0x560
00000307  E2EF              loop 0x2f8
00000309  E922FF            jmp 0x22e
0000030C  80E10F            and cl,0xf
0000030F  FEC1              inc cl
00000311  AC                lodsb
00000312  8BD9              mov bx,cx
00000314  1E                push ds
00000315  56                push si
00000316  32ED              xor ch,ch
00000318  8AC8              mov cl,al
0000031A  83C102            add cx,0x2
0000031D  52                push dx
0000031E  B000              mov al,0x0
00000320  BACF03            mov dx,0x3cf
00000323  EE                out dx,al
00000324  5A                pop dx
00000325  8CC0              mov ax,es
00000327  8ED8              mov ds,ax
00000329  8BF7              mov si,di
0000032B  2BF3              sub si,bx
0000032D  90                nop
0000032E  A4                movsb
0000032F  4A                dec dx
00000330  7508              jnz 0x33a
00000332  E83102            call 0x566
00000335  740D              jz 0x344
00000337  EB04              jmp 0x33d
00000339  90                nop
0000033A  E83302            call 0x570
0000033D  E2EF              loop 0x32e
0000033F  5E                pop si
00000340  1F                pop ds
00000341  E9EAFE            jmp 0x22e
00000344  5E                pop si
00000345  1F                pop ds
00000346  C3                ret
00000347  90                nop
00000348  8AF9              mov bh,cl
0000034A  8AE1              mov ah,cl
0000034C  1E                push ds
0000034D  80E40C            and ah,0xc
00000350  D0CC              ror ah,0x0
00000352  80FC06            cmp ah,0x6
00000355  7547              jnz 0x39e
00000357  80E1F0            and cl,0xf0
0000035A  80E703            and bh,0x3
0000035D  8AE7              mov ah,bh
0000035F  D0C4              rol ah,0x0
00000361  AC                lodsb
00000362  2EA20205          mov [cs:0x502],al
00000366  8AE8              mov ch,al
00000368  8AD8              mov bl,al
0000036A  AC                lodsb
0000036B  86C8              xchg cl,al
0000036D  0E                push cs
0000036E  1F                pop ds
0000036F  861EDA06          xchg bl,[0x6da]
00000373  881EDB06          mov [0x6db],bl
00000377  3C90              cmp al,0x90
00000379  BB8BC0            mov bx,0xc08b
0000037C  7403              jz 0x381
0000037E  E9A300            jmp 0x424
00000381  80FD55            cmp ch,0x55
00000384  7405              jz 0x38b
00000386  80FDAA            cmp ch,0xaa
00000389  7509              jnz 0x394
0000038B  891E0805          mov [0x508],bx
0000038F  BBD0C3            mov bx,0xc3d0
00000392  EB4C              jmp 0x3e0
00000394  BBD0C3            mov bx,0xc3d0
00000397  891E0805          mov [0x508],bx
0000039B  EB43              jmp 0x3e0
0000039D  90                nop
0000039E  8AE9              mov ch,cl
000003A0  80E5F0            and ch,0xf0
000003A3  8AD9              mov bl,cl
000003A5  AC                lodsb
000003A6  8AC8              mov cl,al
000003A8  83E303            and bx,0x3
000003AB  81C3D806          add bx,0x6d8
000003AF  0E                push cs
000003B0  1F                pop ds
000003B1  8A07              mov al,[bx]
000003B3  A20205            mov [0x502],al
000003B6  81FBD806          cmp bx,0x6d8
000003BA  7406              jz 0x3c2
000003BC  4B                dec bx
000003BD  8607              xchg al,[bx]
000003BF  884701            mov [bx+0x1],al
000003C2  80FD90            cmp ch,0x90
000003C5  8A2F              mov ch,[bx]
000003C7  BB8BC0            mov bx,0xc08b
000003CA  7558              jnz 0x424
000003CC  80FD55            cmp ch,0x55
000003CF  7408              jz 0x3d9
000003D1  80FDAA            cmp ch,0xaa
000003D4  7403              jz 0x3d9
000003D6  BBD0C3            mov bx,0xc3d0
000003D9  891E0805          mov [0x508],bx
000003DD  BBD0C3            mov bx,0xc3d0
000003E0  891E0A05          mov [0x50a],bx
000003E4  EB00              jmp 0x3e6
000003E6  8ADC              mov bl,ah
000003E8  32FF              xor bh,bh
000003EA  81C3F006          add bx,0x6f0
000003EE  2E8B07            mov ax,[cs:bx]
000003F1  52                push dx
000003F2  BACF03            mov dx,0x3cf
000003F5  EE                out dx,al
000003F6  5A                pop dx
000003F7  B800A0            mov ax,0xa000
000003FA  8ED8              mov ds,ax
000003FC  32ED              xor ch,ch
000003FE  83C102            add cx,0x2
00000401  B300              mov bl,0x0
00000403  90                nop
00000404  8A05              mov al,[di]
00000406  22C3              and al,bl
00000408  8BC0              mov ax,ax
0000040A  8BC0              mov ax,ax
0000040C  AA                stosb
0000040D  4A                dec dx
0000040E  750A              jnz 0x41a
00000410  E85301            call 0x566
00000413  7503              jnz 0x418
00000415  E92DFF            jmp 0x345
00000418  EB03              jmp 0x41d
0000041A  E84301            call 0x560
0000041D  E2E5              loop 0x404
0000041F  1F                pop ds
00000420  E90BFE            jmp 0x22e
00000423  90                nop
00000424  891E0805          mov [0x508],bx
00000428  EBB6              jmp 0x3e0
0000042A  8AC5              mov al,ch
0000042C  EB0A              jmp 0x438
0000042E  80E10F            and cl,0xf
00000431  8AC1              mov al,cl
00000433  C0C004            rol al,byte 0x4
00000436  0AC1              or al,cl
00000438  AA                stosb
00000439  4A                dec dx
0000043A  750C              jnz 0x448
0000043C  E82701            call 0x566
0000043F  7503              jnz 0x444
00000441  E902FF            jmp 0x346
00000444  E9E7FD            jmp 0x22e
00000447  90                nop
00000448  E81501            call 0x560
0000044B  E9E0FD            jmp 0x22e
0000044E  8AC5              mov al,ch
00000450  EB01              jmp 0x453
00000452  AC                lodsb
00000453  83E10F            and cx,0xf
00000456  80C103            add cl,0x3
00000459  2E880ED205        mov [cs:0x5d2],cl
0000045E  32E4              xor ah,ah
00000460  1E                push ds
00000461  56                push si
00000462  55                push bp
00000463  52                push dx
00000464  52                push dx
00000465  50                push ax
00000466  B000              mov al,0x0
00000468  BACF03            mov dx,0x3cf
0000046B  EE                out dx,al
0000046C  58                pop ax
0000046D  5A                pop dx
0000046E  8CC1              mov cx,es
00000470  8ED9              mov ds,cx
00000472  8BF2              mov si,dx
00000474  33D2              xor dx,dx
00000476  BB0000            mov bx,0x0
00000479  F7F3              div bx
0000047B  2BDE              sub bx,si
0000047D  3BDA              cmp bx,dx
0000047F  7209              jc 0x48a
00000481  03F2              add si,dx
00000483  8BD6              mov dx,si
00000485  03E8              add bp,ax
00000487  EB06              jmp 0x48f
00000489  90                nop
0000048A  2BD3              sub dx,bx
0000048C  40                inc ax
0000048D  03E8              add bp,ax
0000048F  2E8916D505        mov [cs:0x5d5],dx
00000494  A801              test al,0x1
00000496  2E8B0E6306        mov cx,[cs:0x663]
0000049B  7402              jz 0x49f
0000049D  F7D9              neg cx
0000049F  2E890EF705        mov [cs:0x5f7],cx
000004A4  BE0000            mov si,0x0
000004A7  81C60000          add si,0x0
000004AB  2BF5              sub si,bp
000004AD  83F950            cmp cx,0x50
000004B0  7406              jz 0x4b8
000004B2  8BC2              mov ax,dx
000004B4  48                dec ax
000004B5  EB06              jmp 0x4bd
000004B7  90                nop
000004B8  B80000            mov ax,0x0
000004BB  2BC2              sub ax,dx
000004BD  03C0              add ax,ax
000004BF  03C0              add ax,ax
000004C1  03C0              add ax,ax
000004C3  03C0              add ax,ax
000004C5  8BD8              mov bx,ax
000004C7  03C0              add ax,ax
000004C9  03C0              add ax,ax
000004CB  03C3              add ax,bx
000004CD  03F0              add si,ax
000004CF  5A                pop dx
000004D0  5D                pop bp
000004D1  B90000            mov cx,0x0
000004D4  BB0000            mov bx,0x0
000004D7  90                nop
000004D8  A4                movsb
000004D9  4A                dec dx
000004DA  7508              jnz 0x4e4
000004DC  E88700            call 0x566
000004DF  741F              jz 0x500
000004E1  EB04              jmp 0x4e7
000004E3  90                nop
000004E4  E87900            call 0x560
000004E7  4B                dec bx
000004E8  750A              jnz 0x4f4
000004EA  2EF71EF705        neg word [cs:0x5f7]
000004EF  BB0000            mov bx,0x0
000004F2  EB05              jmp 0x4f9
000004F4  4E                dec si
000004F5  81C60000          add si,0x0
000004F9  E2DD              loop 0x4d8
000004FB  5E                pop si
000004FC  1F                pop ds
000004FD  E92EFD            jmp 0x22e
00000500  5E                pop si
00000501  1F                pop ds
00000502  C3                ret
00000503  90                nop
00000504  8AE1              mov ah,cl
00000506  8AF9              mov bh,cl
00000508  AC                lodsb
00000509  8AC8              mov cl,al
0000050B  32ED              xor ch,ch
0000050D  83C102            add cx,0x2
00000510  1E                push ds
00000511  81E3000C          and bx,0xc00
00000515  D0CF              ror bh,0x0
00000517  86DF              xchg bl,bh
00000519  81C3F006          add bx,0x6f0
0000051D  2E8B1F            mov bx,[cs:bx]
00000520  50                push ax
00000521  52                push dx
00000522  BACF03            mov dx,0x3cf
00000525  8AC3              mov al,bl
00000527  EE                out dx,al
00000528  5A                pop dx
00000529  58                pop ax
0000052A  BB00A0            mov bx,0xa000
0000052D  8EDB              mov ds,bx
0000052F  8ADC              mov bl,ah
00000531  83E303            and bx,0x3
00000534  D0C3              rol bl,0x0
00000536  81C3E006          add bx,0x6e0
0000053A  2E8B07            mov ax,[cs:bx]
0000053D  2EA34606          mov [cs:0x646],ax
00000541  EB01              jmp 0x544
00000543  90                nop
00000544  8A05              mov al,[di]
00000546  90                nop
00000547  90                nop
00000548  AA                stosb
00000549  4A                dec dx
0000054A  750A              jnz 0x556
0000054C  E81700            call 0x566
0000054F  7503              jnz 0x554
00000551  E9F1FD            jmp 0x345
00000554  EB03              jmp 0x559
00000556  E80700            call 0x560
00000559  E2E9              loop 0x544
0000055B  1F                pop ds
0000055C  E9CFFC            jmp 0x22e
0000055F  90                nop
00000560  4F                dec di
00000561  81C70000          add di,0x0
00000565  C3                ret
00000566  2EF71E6306        neg word [cs:0x663]
0000056B  BA0000            mov dx,0x0
0000056E  4D                dec bp
0000056F  C3                ret
00000570  2EA06306          mov al,[cs:0x663]
00000574  3C50              cmp al,0x50
00000576  7508              jnz 0x580
00000578  83C74F            add di,0x4f
0000057B  83C64F            add si,0x4f
0000057E  C3                ret
0000057F  90                nop
00000580  83EF51            sub di,0x51
00000583  83EE51            sub si,0x51
00000586  C3                ret
00000587  90                nop
00000588  44                inc sp
00000589  034403            add ax,[si+0x3]
0000058C  52                push dx
0000058D  050406            add ax,0x604
00000590  0C04              or al,0x4
00000592  48                dec ax
00000593  04C2              add al,0xc2
00000595  03F4              add si,sp
00000597  03B40348          add si,[si+0x4803]
0000059B  0492              add al,0x92
0000059D  03920392          add dx,[bp+si-0x6dfd]
000005A1  03920392          add dx,[bp+si-0x6dfd]
000005A5  039203FD          add dx,[bp+si-0x2fd]
000005A9  05FD05            add ax,0x5fd
000005AC  4E                dec si
000005AD  058803            add ax,0x388
000005B0  6C                insb
000005B1  037603            add si,[bp+0x3]
000005B4  FD                std
000005B5  052A05            add ax,0x52a
000005B8  AC                lodsb
000005B9  037603            add si,[bp+0x3]
000005BC  6203              bound ax,[bp+di]
000005BE  6203              bound ax,[bp+di]
000005C0  6203              bound ax,[bp+di]
000005C2  6203              bound ax,[bp+di]
000005C4  6203              bound ax,[bp+di]
000005C6  6203              bound ax,[bp+di]
000005C8  8C01              mov word [bx+di],es
000005CA  8C01              mov word [bx+di],es
000005CC  7201              jc 0x5cf
000005CE  A302BE            mov [0xbe02],ax
000005D1  02C6              add al,dh
000005D3  022603A3          add ah,[0xa303]
000005D7  0200              add al,[bx+si]
000005D9  0000              add [bx+si],al
000005DB  0000              add [bx+si],al
000005DD  FF55AA            call word near [di-0x56]
000005E0  8BC0              mov ax,ax
000005E2  F6D0              not al
000005E4  D0C8              ror al,0x0
000005E6  D0C0              rol al,0x0
000005E8  0000              add [bx+si],al
000005EA  0100              add [bx+si],ax
000005EC  0200              add al,[bx+si]
000005EE  0300              add ax,[bx+si]
000005F0  0000              add [bx+si],al
000005F2  0000              add [bx+si],al
000005F4  0000              add [bx+si],al
000005F6  0000              add [bx+si],al
000005F8  54                push sp
000005F9  46                inc si
000005FA  2D4443            sub ax,0x4344
000005FD  45                inc bp
000005FE  2035              and [di],dh
00000600  2E3131            xor [cs:bx+di],si
00000603  2031              and [bx+di],dh
00000605  3939              cmp [bx+di],di
00000607  34FC              xor al,0xfc
00000609  B062              mov al,0x62
0000060B  2EA23B07          mov [cs:0x73b],al
0000060F  2EA24B07          mov [cs:0x74b],al
00000613  2EA25F07          mov [cs:0x75f],al
00000617  2EA27107          mov [cs:0x771],al
0000061B  32C0              xor al,al
0000061D  3A068000          cmp al,[0x80]
00000621  7438              jz 0x65b
00000623  BE8100            mov si,0x81
00000626  E88700            call 0x6b0
00000629  3C0D              cmp al,0xd
0000062B  742E              jz 0x65b
0000062D  3C4E              cmp al,0x4e
0000062F  742A              jz 0x65b
00000631  3C52              cmp al,0x52
00000633  7405              jz 0x63a
00000635  B8014C            mov ax,0x4c01
00000638  CD21              int byte 0x21
0000063A  B86235            mov ax,0x3562
0000063D  CD21              int byte 0x21
0000063F  E88E00            call 0x6d0
00000642  75F1              jnz 0x635
00000644  1E                push ds
00000645  26C5165E02        lds dx,word [es:0x25e]
0000064A  B86225            mov ax,0x2562
0000064D  CD21              int byte 0x21
0000064F  1F                pop ds
00000650  B449              mov ah,0x49
00000652  CD21              int byte 0x21
00000654  72DF              jc 0x635
00000656  B8004C            mov ax,0x4c00
00000659  CD21              int byte 0x21
0000065B  A28107            mov [0x781],al
0000065E  B86235            mov ax,0x3562
00000661  CD21              int byte 0x21
00000663  E86A00            call 0x6d0
00000666  74CD              jz 0x635
00000668  891E5E02          mov [0x25e],bx
0000066C  8C066002          mov word [0x260],es
00000670  B86225            mov ax,0x2562
00000673  BA0401            mov dx,0x104
00000676  CD21              int byte 0x21
00000678  8E062C00          mov es,word [0x2c]
0000067C  B449              mov ah,0x49
0000067E  CD21              int byte 0x21
00000680  B000              mov al,0x0
00000682  3C4E              cmp al,0x4e
00000684  7507              jnz 0x68d
00000686  BADB07            mov dx,0x7db
00000689  B409              mov ah,0x9
0000068B  CD21              int byte 0x21
0000068D  0E                push cs
0000068E  07                pop es
0000068F  B91A00            mov cx,0x1a
00000692  880E8000          mov [0x80],cl
00000696  D0E9              shr cl,0x0
00000698  BE5B08            mov si,0x85b
0000069B  BF8100            mov di,0x81
0000069E  F3A5              rep movsw
000006A0  BA1807            mov dx,0x718
000006A3  D1EA              shr dx,0x0
000006A5  D1EA              shr dx,0x0
000006A7  D1EA              shr dx,0x0
000006A9  D1EA              shr dx,0x0
000006AB  B80031            mov ax,0x3100
000006AE  CD21              int byte 0x21
000006B0  AC                lodsb
000006B1  3C20              cmp al,0x20
000006B3  74FB              jz 0x6b0
000006B5  3C09              cmp al,0x9
000006B7  74F7              jz 0x6b0
000006B9  3C2C              cmp al,0x2c
000006BB  74F3              jz 0x6b0
000006BD  3C2D              cmp al,0x2d
000006BF  74EF              jz 0x6b0
000006C1  3C2F              cmp al,0x2f
000006C3  74EB              jz 0x6b0
000006C5  3C61              cmp al,0x61
000006C7  7206              jc 0x6cf
000006C9  3C7A              cmp al,0x7a
000006CB  7702              ja 0x6cf
000006CD  2C20              sub al,0x20
000006CF  C3                ret
000006D0  BEF806            mov si,0x6f8
000006D3  8BFE              mov di,si
000006D5  B90800            mov cx,0x8
000006D8  F3A7              repe cmpsw
000006DA  C3                ret
000006DB  44                inc sp
000006DC  4F                dec di
000006DD  53                push bx
000006DE  2F                das
000006DF  56                push si
000006E0  205365            and [bp+di+0x65],dl
000006E3  7269              jc 0x74e
000006E5  657320            gs jnc 0x708
000006E8  54                push sp
000006E9  46                inc si
000006EA  2D6772            sub ax,0x7267
000006ED  61                popa
000006EE  7068              jo 0x758
000006F0  6963204461        imul sp,[bp+di+0x20],0x6144
000006F5  7461              jz 0x758
000006F7  204578            and [di+0x78],al
000006FA  7061              jo 0x75d
000006FC  6E                outsb
000006FD  64204472          and [fs:si+0x72],al
00000701  6976657220        imul si,[bp+0x65],0x2072
00000706  56                push si
00000707  657220            gs jc 0x72a
0000070A  312E3534          xor [0x3435],bp
0000070E  0D0A20            or ax,0x200a
00000711  50                push ax
00000712  726F              jc 0x783
00000714  677261            a32 jc 0x778
00000717  6D                insw
00000718  6D                insw
00000719  6564206279        and [fs:bp+si+0x79],ah
0000071E  20542E            and [si+0x2e],dl
00000721  46                inc si
00000722  55                push bp
00000723  4A                dec dx
00000724  49                dec cx
00000725  4E                dec si
00000726  55                push bp
00000727  4D                dec bp
00000728  41                inc cx
00000729  202F              and [bx],ch
0000072B  20434F            and [bp+di+0x4f],al
0000072E  50                push ax
0000072F  59                pop cx
00000730  205249            and [bp+si+0x49],dl
00000733  47                inc di
00000734  48                dec ax
00000735  54                push sp
00000736  2028              and [bx+si],ch
00000738  43                inc bx
00000739  2920              sub [bx+si],sp
0000073B  54                push sp
0000073C  2E46              cs inc si
0000073E  55                push bp
0000073F  4A                dec dx
00000740  49                dec cx
00000741  4E                dec si
00000742  55                push bp
00000743  4D                dec bp
00000744  41                inc cx
00000745  285446            sub [si+0x46],dl
00000748  2D3932            sub ax,0x3239
0000074B  3829              cmp [bx+di],ch
0000074D  2031              and [bx+di],dh
0000074F  3939              cmp [bx+di],di
00000751  332D              xor bp,[di]
00000753  3139              xor [bx+di],di
00000755  3935              cmp [di],si
00000757  2E0D0A24          cs or ax,0x240a
0000075B  54                push sp
0000075C  46                inc si
0000075D  2D4445            sub ax,0x4544
00000760  44                inc sp
00000761  205665            and [bp+0x65],dl
00000764  7231              jc 0x797
00000766  2E353420          cs xor ax,0x2034
0000076A  2F                das
0000076B  627920            bound di,[bx+di+0x20]
0000076E  54                push sp
0000076F  46                inc si
00000770  2D3932            sub ax,0x3239
00000773  3800              cmp [bx+si],al
00000775  0020              add [bx+si],ah
00000777  54                push sp
00000778  46                inc si
00000779  2D4443            sub ax,0x4344
0000077C  45                inc bp
0000077D  285461            sub [si+0x61],dl
00000780  6B617975          imul sp,[bx+di+0x79],0x75
00000784  6B692046          imul bp,[bx+di+0x20],0x46
00000788  756A              jnz 0x7f4
0000078A  696E756D61        imul bp,[bp+0x75],0x616d
0000078F  206772            and [bx+0x72],ah
00000792  61                popa
00000793  7068              jo 0x7fd
00000795  6963204461        imul sp,[bp+di+0x20],0x6144
0000079A  7461              jz 0x7fd
0000079C  20436F            and [bp+di+0x6f],al
0000079F  6D                insw
000007A0  7072              jo 0x814
000007A2  657373            gs jnc 0x818
000007A5  20262045          and [0x4520],ah
000007A9  7870              js 0x81b
000007AB  61                popa
000007AC  6E                outsb
000007AD  642920            sub [fs:bx+si],sp
000007B0  53                push bx
000007B1  59                pop cx
000007B2  53                push bx
000007B3  54                push sp
000007B4  45                inc bp
000007B5  4D                dec bp
000007B6  205665            and [bp+0x65],dl
000007B9  7220              jc 0x7db
000007BB  352E31            xor ax,0x312e
000007BE  3120              xor [bx+si],sp
000007C0  20                db 0x20
