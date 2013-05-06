root = exports ? this


makeDateFromTS = (ts) ->
    days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    d = new Date parseInt ts
    retval = {}
    retval.iso = d.toISOString()
    y=d.getUTCFullYear()
    m=d.getUTCMonth()+1
    m = "0#{m}" if m < 10
    t=d.getUTCDate()
    t = "0#{t}" if t < 10
    retval.day = "#{y}-#{m}-#{t}Z"
    h = d.getUTCHours()
    h= "0#{h}" if h < 10
    mm = d.getUTCMinutes()
    mm = "0#{mm}" if mm < 10
    retval.time = "#{h}:#{mm}:00Z"
    dow = d.getUTCDay()
    retval.dow = days[dow]
    retval

root.getPrefixes = ->
    pa = [
        "@prefix act: <http://schemas.simonf.net/activities/core#> .",
        "@prefix dc:  <http://purl.org/dc/elements/1.1/> .",
        "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .",
        "@prefix tim: <http://www.w3.org/2006/time#> .",
        "@prefix unt: <http://www.w3.org/2007/ont/unit#> ."
    ]
    pa.join "\n"

root.convertToN3 = (cnt,doc) ->
    id = "_:activity#{cnt}"
    dt = makeDateFromTS doc.updatedAt
    usr_pred = "dc:Creator"
    ts_pred = "tim:inXSDDateTime"
    dow_pred = "tim:DayOfWeek"
    day_pred = "dc:date"
    cat_pred = "act:Category"
    act_pred = "act:Action"
    val_pred = "act:Value"
    qty_id = "_:activity#{cnt}qty"
    unit_pred =	"act:Unit"
    qty_pred = "act:Quantity"
    unit_equiv = [
        {raw: "hr", cooked: "tim:hours"},
        {raw: "hour", cooked: "tim:hours"},
        {raw: "hours", cooked: "tim:hours"},
        {raw: "min", cooked: "tim:minutes"},
        {raw: "mins", cooked: "tim:minutes"},
        {raw: "kg", cooked: "unt:kg"},
        {raw: "mile", cooked: "unt:mile"},
        {raw: "miles", cooked: "unt:mile"},
        {raw: null, cooked: "unt:Quantity"}
    ]
    hr_min_pred = "tim:HourMinute"

    subject = id
    retval=[]
    retval.push "#{id} dc:Creator \"#{doc.user}\" ."
    retval.push "#{id} act:Category \"#{doc.category}\" ."
    retval.push "#{id} act:Action \"#{doc.action}\" ."
    retval.push "#{id} #{ts_pred} \"#{dt.iso}\"^^xsd:dateTime ."
    retval.push "#{id} #{dow_pred} \"#{dt.dow}\" ."
    retval.push "#{id} #{day_pred} \"#{dt.day}\"^^xsd:date ."
    retval.push "#{id} #{qty_pred} #{qty_id} ."
    if doc.quantity? and doc.quantity.toString().match(":") != null
        retval.push "#{qty_id} #{hr_min_pred} \"#{doc.quantity}\" ."
    else
        if (doc.quantity*10)%10 == 0
            retval.push "#{qty_id} #{val_pred} \"#{doc.quantity}\"^^xsd:integer ."
        else
            retval.push "#{qty_id} #{val_pred} \"#{doc.quantity}\" ."
        match = (trans.cooked for trans in unit_equiv when trans.raw == doc.units)
        if match.length == 1
            retval.push "#{qty_id} #{unit_pred} #{match[0]} ."
    return retval.join "\n"
