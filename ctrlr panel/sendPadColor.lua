--
-- Called when a panel receives a midi message (does not need to match any modulator mask)
-- @midi   CtrlrMidiMessage object
--
sendPadColor = function(--[[ CtrlrMidiMessage --]] midi)
	local prefix = "f0 00 20 6b 7f 42 02 00 10 "
	local suffix = " f7"
    
    local number = midi:getNumber()
    local value = midi:getValue()
    local padNumber = "70"
    local color = "00"
    
    if not number ~= nil and not value ~= nil then
    	if number > 101 and number < 110 then padNumber = "7" .. string.format( "%x", number - 102) else return end
        if value < 128 then color = string.format("%02x", value) else return end
        -- Send the color change
        local message = prefix .. padNumber .. " " .. color .. suffix
        
        panel:sendMidiMessageNow(CtrlrMidiMessage(message))
    end
end
